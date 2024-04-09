// import React, { useEffect, useState } from "react";
// import ReactQuill from "react-quill";
// // import "react-quill/dist/quill.snow.css";
// // import ImageResize from "quill-image-resize-module-react";
// import ReactHtmlParser from "react-html-parser";

// const Texteditor = () => {
//   const parsingData = ReactHtmlParser(editorHtml);
//   setParsedHtml(parsingData);

//   const modules = {
//     toolbar: [
//       [{ header: "1" }, { header: "2" }, { font: [] }],
//       [{ color: [] }],
//       [{ size: [] }],
//       ["bold", "italic", "underline", "strike", "blockquote"],
//       [
//         { list: "ordered" },
//         { list: "bullet" },
//         { indent: "-1" },
//         { indent: "+1" },
//       ],
//       ["link", "image", "video"],
//       ["clean"],
//     ],
//     imageResize: {},
//     clipboard: {
//       // toggle to add extra line breaks when pasting HTML:
//       matchVisual: false,
//     },
//   };

//   const formats = [
//     "header",
//     "color",
//     "font",
//     "size",
//     "bold",
//     "italic",
//     "underline",
//     "strike",
//     "blockquote",
//     "list",
//     "bullet",
//     "indent",
//     "link",
//     "image",
//     "video",
//   ];
//   return (
//     <div>
//       <ReactQuill
//         theme="snow"
//         value={editorHtml}
//         onChange={setEditorHtml}
//         modules={modules}
//         formats={formats}
//       />

//       <div
//         className="output-container"
//         dangerouslySetInnerHTML={{ __html: editorHtml }}
//       />
//     </div>
//   );
// };

// export default Texteditor;
