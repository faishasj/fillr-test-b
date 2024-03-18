"use strict";
// Write your module here
// It must send an event "frames:loaded" from the top frame containing a list of { name:label } pairs,
// which describes all the fields in each frame.

// This is a template to help you get started, feel free to make your own solution.
function execute() {
  try {
    // Step 1 Scrape Fields and Create Fields list object.
    var processedFrames = 0;

    // Map over all labels in frame to create fields list
    var fields = Array.from(document.getElementsByTagName("label")).map(
      (label) => {
        // Get field element by quering id from label's "for" attribute
        const field = document.getElementById(label.getAttribute("for"));
        // Return object { name:label }
        return { [field.name]: label.innerText };
      }
    );

    // Step 2 Add Listener for Top Frame to Receive Fields.

    if (isTopFrame()) {
      window.addEventListener("message", (event) => {
        // - Merge fields from frames.
        fields = [...fields, ...event.data];
        processedFrames += 1;

        // - Process Fields and send event once all fields are collected.
        if (processedFrames === 2) {
          fields = sortAlphabetically(fields);

          document.dispatchEvent(
            new CustomEvent("frames:loaded", { detail: { fields } })
          );
        }
      });
    } else if (!isTopFrame()) {
      // Child frames sends Fields up to Top Frame.
      getTopFrame().postMessage(fields, "*");
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
