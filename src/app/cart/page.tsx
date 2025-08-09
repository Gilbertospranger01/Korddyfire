import Loadingpage from "@/loadingpages/loadingpage";
import React from "react";

function Cart() {

  if (!session) {
    return (
      <Loadingpage />
    );
  }
  return (
    <div>
      <h1>Cart</h1>
    </div>
  );
}

export default Cart;
