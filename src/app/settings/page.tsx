import Loadingpage from "@/loadingpages/loadingpage";
import React from "react";

function Settings() {

  if (!session) {
    return (
      <Loadingpage />
    );
  }
  return (
    <div>
      <h1>Settings</h1>
    </div>
  );
}

export default Settings;
