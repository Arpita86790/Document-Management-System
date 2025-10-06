import React from "react";
import UploadDocument from "./components/UploadDocument";
import DocumentList from "./components/DocumentList";
import SearchDocument from "./components/SearchDocument";

function App() {
  return (
    <div className="container">
      <h1>📂 Document Management System</h1>
      <UploadDocument />
      <SearchDocument />
      <DocumentList />
    </div>
  );
}

export default App;
