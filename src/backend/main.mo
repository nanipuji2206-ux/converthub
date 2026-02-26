import Map "mo:core/Map";
import Text "mo:core/Text";

actor {
  let toolUsage = Map.empty<Text, Nat>();
  var totalConversions = 0;

  public shared ({ caller }) func recordConversion(toolName : Text) : async () {
    let currentCount = switch (toolUsage.get(toolName)) {
      case (null) { 0 };
      case (?count) { count };
    };
    toolUsage.add(toolName, currentCount + 1);
    totalConversions += 1;
  };

  public query ({ caller }) func getToolUsage(toolName : Text) : async Nat {
    switch (toolUsage.get(toolName)) {
      case (null) { 0 };
      case (?count) { count };
    };
  };

  public query ({ caller }) func getTotalConversions() : async Nat {
    totalConversions;
  };
};
