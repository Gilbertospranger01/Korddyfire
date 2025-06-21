import Loadingpage from "../../loadingpages/loadingpage";
import React from "react";

function Shopping() {

  if (!session) {
    return (
      <Loadingpage />
    );
  }

  return (
    <div>
      <h1>Shopping</h1>
    </div>
  );
}

export default Shopping;
