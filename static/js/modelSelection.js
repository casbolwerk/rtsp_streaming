let selectedList = [];
console.log('Selected elements: ', selectedList);
        
function clear(list) {
    // clear selection list
    for (var i = 0; i < list.length; i++) {
        list[i].style.background = "";
    }
}

function select(element) {
    // Select element by first clearing the list and then adding it
    clear(selectedList);
    selectedList = [element];
    element.style.background = "#edeff259";
    console.log('Selected elements: ', selectedList);
}

function deselect(element) {
    // deselect element by resetting the selected list
    const index = selectedList.indexOf(element);
    selectedList.splice(index, 1);
    element.style.background = "";
    console.log('Deselected elements: ', selectedList);
}

function modelSelector() {
    // either select or deselect currently clicked element
    console.log('modelselector')
    if (selectedList.includes(this)) {
        deselect(this)
    }
    else {
        select(this)
    }
}

function sendModel() {
    // determine model to be sent and send it
    let model;
    if (selectedList.length > 0) {
        console.log('send model')
        model = selectedList[0];
        console.log(model.id);
        socket.emit('reloadEngine', {'engine': str(model.firstChild.innerHTML)});
    }
    clear(selectedList);
}

function getModels() {
    socket.emit('getModels', {});
}

function addModels(modelList) {
    // <div id="modelList" class="items-body">
    // <div id="1" class="items-body-content">
    // <span>Model 1</span>

    // add models dynamically from given model list
    var parentList = document.getElementById('modelList');
    var parentCount = parentList.childElementCount;
    var count = modelList.length;
    console.log('parentCount: ', parentCount, 'count: ', count);
    for(var i = parentCount; i < parentCount + count; i++) {
        var model = modelList[i-parentCount];

        // create a new div element 
        var modelDiv = document.createElement("div"); 
        var modelNumber = i+1;
        modelDiv.id = modelNumber.toString();
        modelDiv.classList.add("items-body-content");

        // create the span that sits inside the new div
        var modelName = document.createElement("span");
        modelName.innerHTML = model;
        modelDiv.appendChild(modelName);
    
        // add the new div to the parent div
        parentList.appendChild(modelDiv);
    }
    // add event listeners for model selection to new models
    const models = document.querySelectorAll('.items-body-content');
    models.forEach(el => el.addEventListener('click', modelSelector, false));
}