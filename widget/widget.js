"use strict";
// Module that sends an event "frames:loaded" from the top frame containing a list of { name:label } pairs,
// which describes all the fields in each frame.

// Function that runs on each frame.
function execute() {
  try {
    // Number of frames processed - not including top frame
    var numProcessedFrames = 0;

    // Number of child frames within current frame
    var numChildFrames = Array.from(
      document.getElementsByTagName("iframe")
    ).length;

    // Map over all labels in frame to create fields list
    var fields = Array.from(document.getElementsByTagName("label")).map(
      (label) => {
        // Get field element by quering id from label's "for" attribute
        const field = document.getElementById(label.getAttribute("for"));
        // Return object { name:label }
        return { [field.name]: label.innerText };
      }
    );

    // Add Listener for Top Frame to Receive Fields.
    if (isTopFrame()) {
      window.addEventListener("message", (event) => {
        // Merge fields from frames.
        fields = [...fields, ...event.data.fields];
        numProcessedFrames += 1;

        // Add on number of child frames of the child frame to the top frame.
        numChildFrames += event.data.numChildFrames;

        // Once fields have been received from all child frames
        if (numProcessedFrames === numChildFrames) {
          // Sort fields by name alphabetically ascending
          fields = sortAlphabetically(fields);

          // Dispatch frames:loaded event with fields in detail
          document.dispatchEvent(
            new CustomEvent("frames:loaded", { detail: { fields } })
          );
        }
      });
    } else if (!isTopFrame()) {
      // Child frames sends Fields and number of child frames up to Top Frame.
      getTopFrame().postMessage({ fields, numChildFrames }, "*");
    }
  } catch (e) {
    console.error(e);
  }
}

execute();

// Sort a list of objects by key alphabetically
function sortAlphabetically(fields) {
  return fields.sort((a, b) => {
    const aKey = Object.keys(a)[0];
    const bKey = Object.keys(b)[0];

    if (aKey > bKey) return 1;
    if (aKey < bKey) return -1;
    return 0;
  });
}

// Utility functions to check and get the top frame
// as Karma test framework changes top & context frames.
// Use this instead of "window.top".
function getTopFrame() {
  return window.top.frames[0];
}

function isTopFrame() {
  return window.location.pathname == "/context.html";
}
