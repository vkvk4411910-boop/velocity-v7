import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";



actor {
  // Authorization component (used only for admin checks)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // Helper: any signed-in (non-anonymous) user is allowed
  func requireSignedIn(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
  };

  // ── User Profiles ────────────────────────────────────────────────────────

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireSignedIn(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireSignedIn(caller);
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Text, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    userProfiles.entries().toArray().map(
      func((p, profile)) { (p.toText(), profile) }
    );
  };

  // ── Login Tracking ───────────────────────────────────────────────────────

  public type LoginRecord = {
    principal : Principal;
    name : Text;
    lastLogin : Time.Time;
    loginCount : Nat;
  };

  let loginRecords = Map.empty<Principal, LoginRecord>();

  public shared ({ caller }) func recordLogin() : async () {
    requireSignedIn(caller);
    let currentTime = Time.now();
    let profileName = switch (userProfiles.get(caller)) {
      case (null) { "" };
      case (?p) { p.name };
    };
    let record = switch (loginRecords.get(caller)) {
      case (null) {
        { principal = caller; name = profileName; lastLogin = currentTime; loginCount = 1 };
      };
      case (?existing) {
        { principal = caller; name = profileName; lastLogin = currentTime; loginCount = existing.loginCount + 1 };
      };
    };
    loginRecords.add(caller, record);
  };

  public query ({ caller }) func getLoginHistory() : async [(Text, LoginRecord)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    loginRecords.entries().toArray().map(
      func((p, record)) { (p.toText(), record) }
    );
  };

  // ── Products ──────────────────────────────────────────────────────────────

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

  public shared ({ caller }) func createProduct(product : Product) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    let id = nextProductId;
    products.add(id, { product with id });
    nextProductId += 1;
    id;
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    products.remove(productId);
  };

  public query func listProducts() : async [Product] {
    products.values().toArray();
  };

  public query func filterProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(
      func(product) { Text.equal(product.category, category) }
    );
  };

  public query func getProduct(productId : Nat) : async ?Product {
    products.get(productId);
  };

  // ── Orders ────────────────────────────────────────────────────────────────

  // OrderItem stores a snapshot of the product at purchase time
  public type OrderItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    priceCents : Nat;
  };

  public type OrderStatus = { #pending; #paid; #shipped; #delivered };

  public type Order = {
    id : Nat;
    user : Principal;
    items : [OrderItem];
    totalCents : Nat;
    status : OrderStatus;
    createdAt : Time.Time;
  };

  // Legacy CartItem (for backend cart compatibility)
  public type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  let carts = Map.empty<Principal, List.List<CartItem>>();
  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  // Legacy backend cart
  public query ({ caller }) func getCart() : async [CartItem] {
    requireSignedIn(caller);
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    requireSignedIn(caller);
    if (quantity == 0) Runtime.trap("Quantity must be > 0");
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let cart = switch (carts.get(caller)) {
          case (null) { List.empty<CartItem>() };
          case (?c) { c };
        };
        cart.add({ productId; quantity });
        carts.add(caller, cart);
      };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    requireSignedIn(caller);
    switch (carts.get(caller)) {
      case (null) { () };
      case (?cart) {
        carts.add(caller, cart.filter(func(i) { i.productId != productId }));
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    requireSignedIn(caller);
    carts.remove(caller);
  };

  // Place order from backend cart (snapshots product names/prices)
  public shared ({ caller }) func placeOrder() : async Nat {
    requireSignedIn(caller);
    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?c) {
        if (c.isEmpty()) Runtime.trap("Cart is empty");
        c;
      };
    };
    let orderItems = cart.toArray().map(func(item) {
      switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found") };
        case (?p) {
          { productId = item.productId; productName = p.name; quantity = item.quantity; priceCents = p.priceCents };
        };
      };
    });
    var total = 0;
    for (item in orderItems.values()) {
      total += item.priceCents * item.quantity;
    };
    let orderId = nextOrderId;
    orders.add(orderId, {
      id = orderId; user = caller; items = orderItems;
      totalCents = total; status = #pending; createdAt = Time.now();
    });
    nextOrderId += 1;
    carts.remove(caller);
    orderId;
  };

  // PRIMARY: Place order directly from frontend cart
  public shared ({ caller }) func placeOrderDirect(items : [OrderItem], totalCents : Nat) : async Nat {
    requireSignedIn(caller);
    if (items.size() == 0) Runtime.trap("Order must have at least one item");
    let orderId = nextOrderId;
    orders.add(orderId, {
      id = orderId; user = caller; items;
      totalCents; status = #pending; createdAt = Time.now();
    });
    nextOrderId += 1;
    orderId;
  };

  public query ({ caller }) func getOrders() : async [Order] {
    requireSignedIn(caller);
    orders.values().toArray().filter(func(o) { o.user == caller });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { orders.add(orderId, { order with status }) };
    };
  };

  // ── Stripe ────────────────────────────────────────────────────────────────

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?v) { v };
    };
  };

  public shared ({ caller }) func createCheckoutSession(
    items : [Stripe.ShoppingItem],
    successUrl : Text,
    cancelUrl : Text
  ) : async Text {
    requireSignedIn(caller);
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
