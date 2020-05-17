(function () {
  window.editor = CodeMirror(document.getElementById("editor"), {
    lineNumbers: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
    mode: { name: "javascript", globalVars: true },
  });

  window.editor.setSize(null, "100%")

  window.editor.on("keyup", (cm, event) => {
    if (!cm.state.completionActive
      && isAutocompleteActivationKey(event)
    ) {
      CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
    }
  });

  function isAutocompleteActivationKey(event) {
    return event.key === "."
      || event.keyCode === 17 // Control key
      || isIdentifierCharactersKey(event.key);
  }

  function isIdentifierCharactersKey(char) {
    if (char.length > 1) return false;

    let code = char.charCodeAt(0);
    return code >= "a".charCodeAt(0) && code <= "z".charCodeAt(0)
      || code >= "A".charCodeAt(0) && code <= "Z".charCodeAt(0)
      || code >= "0".charCodeAt(0) && code <= "9".charCodeAt(0)
      || code === "_".charCodeAt(0);
  }
})();
