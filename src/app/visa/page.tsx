import Loadingpage from "../../loadingpages/loadingpage";
import React from "react";

function Visa() {

  if (!session) {
    return (
      <Loadingpage />
    );
  }
  return (
    <div>
      <h1>Visa</h1>
    </div>
  );
}

export default Visa;
