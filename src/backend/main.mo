import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";

actor {
  // Prefabricated Authorization component
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // User profiles
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product catalog
  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    priceCents : Nat;
    imageUrl : Text;
    category : Text;
    stock : Nat;
  };

  let products = Map.empty<Nat, Product>();
  var nextProductId = 1;

  // Shopping cart
  public type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  let carts = Map.empty<Principal, List.List<CartItem>>();

  // Orders
  public type OrderStatus = {
    #pending;
    #paid;
    #shipped;
    #delivered;
  };

  public type Order = {
    id : Nat;
    user : Principal;
    items : [CartItem];
    totalCents : Nat;
    status : OrderStatus;
    createdAt : Time.Time;
  };

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  // Product management
  public shared ({ caller }) func createProduct(product : Product) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };
    let id = nextProductId;
    products.add(id, { product with id });
    nextProductId += 1;
    id;
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(productId);
  };

  public query ({ caller }) func listProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func filterProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        Text.equal(product.category, category);
      }
    );
  };

  public query ({ caller }) func getProduct(productId : Nat) : async ?Product {
    products.get(productId);
  };

  // Shopping cart management
  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access cart");
    };
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };
    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };
    switch (products.get(productId)) {
      case (null) {
        Runtime.trap("Product does not exist");
      };
      case (?_) {
        let cart = switch (carts.get(caller)) {
          case (null) { List.empty<CartItem>() };
          case (?existing) { existing };
        };
        cart.add({ productId; quantity });
        carts.add(caller, cart);
      };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };
    switch (carts.get(caller)) {
      case (null) { () };
      case (?cart) {
        let filteredCart = cart.filter(
          func(item) { item.productId != productId }
        );
        carts.add(caller, filteredCart);
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.remove(caller);
  };

  // Order management
  public shared ({ caller }) func placeOrder() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    let cart = switch (carts.get(caller)) {
      case (null) {
        Runtime.trap("Cart is empty");
      };
      case (?cartItems) {
        if (cartItems.isEmpty()) {
          Runtime.trap("Cart is empty");
        };
        cartItems;
      };
    };

    var totalCents = 0.0;

    for (item in cart.values()) {
      switch (products.get(item.productId)) {
        case (null) {
          Runtime.trap("Product not found in cart");
        };
        case (?product) {
          totalCents += product.priceCents.toFloat() * item.quantity.toFloat();
        };
      };
    };

    // Convert totalCents to Int and check for negative values
    let totalCentsInt = totalCents.toInt();
    if (totalCentsInt < 0) {
      Runtime.trap("Total cents cannot be negative");
    };

    let orderId = nextOrderId;
    let order : Order = {
      id = orderId;
      user = caller;
      items = cart.toArray();
      totalCents = totalCentsInt.toNat();
      status = #pending;
      createdAt = Time.now();
    };

    orders.add(orderId, order);
    nextOrderId += 1;
    carts.remove(caller);
    orderId;
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let userOrders = orders.values().toArray().filter(
      func(order) { order.user == caller }
    );
    userOrders;
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (order.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update orders");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        orders.add(orderId, { order with status });
      };
    };
  };

  // Payment operations with Stripe
  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
