let editorY = CodeMirror.fromTextArea(document.getElementById("ycode"), {
    lineNumbers: true,
    styleActiveLine: true,
});

editorY.setOption("theme", "dracula");

editorY.on("changes", function(yeditor) {
    render(yeditor);
});

function render(yeditor) {
    let val = yeditor.getValue();

    try {
        prepareJsonView(YAML.parse(val));
    } catch (e) {
        let jsonElement = document.getElementById("jsonviewer");
        while (jsonElement.firstChild) {
            jsonElement.removeChild(jsonElement.firstChild);
        }

        let errEl = document.createElement("p");
        errEl.className = 'err-text';
        errEl.innerHTML = e;

        jsonElement.appendChild(errEl);
    }
}

render(editorY);

function getInfo() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            let data = JSON.parse(xhr.responseText);

            let tempFn = doT.template(
                "<p><span class='big'>dAPI uptime:&nbsp;</span> {{=it.uptime}}</p>" +
                "<p><span class='big'>dAPI host:&nbsp;</span> localhost:{{=it.server_info.port}}</p>" +
                "<p><span class='big'>API host:&nbsp;</span> {{=it.server_info.api}}</p>" +
                "<hr>" +
                "{{~it.logs :e:index}}" +
                    "<p class='l'><span class='url {{?e.ghost}}ghost{{?}}'>{{=e.url}}</span><span class='code'>{{=e.status_code}}</span><span class='method'>{{=e.method}}</span></p>" +
                "{{~}}"
            );

            let resultText = tempFn(data);

            document.getElementById('info-dash').innerHTML = resultText;
        }
    };
    xhr.open('GET', '/dapilive', true);
    xhr.send(null);
}


setInterval(function() {
    getInfo();
}, 1000);

function prepareJsonView(json) {
    const formatter = new JSONFormatter(json, 6, {theme: 'dark'});
    let jsonElement = document.getElementById("jsonviewer");

    while (jsonElement.firstChild) {
        jsonElement.removeChild(jsonElement.firstChild);
    }

    jsonElement.appendChild(formatter.render());
}
