 

// ----------multiplefile-upload---------
$("#fileupload").fileinput({
    theme: "explorer-fas",
    uploadUrl: "#",
    deleteUrl: "#",
    initialPreviewAsData: true,
    overwriteInitial: false,
    dropZoneTitle: '<div class="upload-area text-center"><i class="far fa-images"></i><p>Browse or Drag and Drop .jpg, .png, .pdf</p> <div class="text-center"> <button>Browse File</button> </div></div>',
    dropZoneClickTitle: "",
    browseOnZoneClick: true,
    showRemove: false,
    showUpload: false,
    showZoom: false,
    showCaption: false,
    showBrowse: false,
    browseClass: "btn btn-danger",
    browseLabel: "",
    browseIcon: "<i class='fa fa-plus'></i>",
    fileActionSettings: {
        showUpload: false,
        showDownload: false,
        showZoom: false,
        showDrag: true,
        removeIcon: "<i class='fa fa-times'></i>",
        uploadIcon: "<i class='fa fa-upload'></i>",
        dragIcon: "<i class='fa fa-arrows-alt'></i>",
        uploadRetryIcon: "<i class='fa fa-undo-alt'></i>",
        dragClass: "file-drag",
        removeClass: "file-remove",
        removeErrorClass: 'file-remove',
        uploadClass: "file-upload",
    },
    frameClass: "file-sortable",
    layoutTemplates: {
        preview:
            '<div class="file-preview {class}">\n' +
            '    <div class="{dropClass}">\n' +
            '    <div class="clearfix"></div>' +
            '    <div class="file-preview-status text-center text-success"></div>\n' +
            '    <div class="kv-fileinput-error"></div>\n' +
            "    </div>\n" +
            "</div>" +
            ' <div class="file-preview-thumbnails">\n' +
            " </div>\n",
        actionDrag: '<button class="file-drag-handle {dragClass}" title="{dragTitle}">{dragIcon}</button>',
        footer: '<div class="file-thumbnail-footer">\n' + '<div class="file-detail">' + '<div class="file-caption-name">{caption}</div>\n' + '    <div class="file-size">{size}</div>\n' + "</div>" + "   {actions}\n" + "</div>",
    },
    maxFileCount: 1,

});


const csrfToken = $('#csrf_token').val()
$("#fileupload").on("change", async function (event) { 

    try { 
    
        const file = event.target.files[0];
        const formData = new FormData()
        formData.append("file", file)
         

        fetch('/display', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken
            },
            body: formData
        })
        .then(response => response.blob() )
        .then(blob => { 
           
            const objectUrl = URL.createObjectURL(blob); 
           
            pdf_pages_function(objectUrl, file)
        });
        
        $('#upload_pdf').css("display", "none");
        $('#display_pdf').css("display", "block");
        $("#display_fields").css("display", "block");


    } catch (error) {
        console.error('Error:', error);
    }
});
let pdf_name="";
let currentPage = 1;
function pdf_pages_function(pdf_url, file){

const pdfImageContainer = document.getElementById('pdfImageContainer');
const pageSelector = document.getElementById('pageSelector');


const pdfFile = pdf_url; // Replace with the actual PDF file path
var file_name = file.name
pdf_name = file_name;
var isPDF = file_name.toLowerCase().endsWith('.pdf');
let pdfDoc = null;
let template_data_obj = obj[pdf_name] = [];
dataObject["pdf_name"]=pdf_name


function display_pdf_Image(pageNumber) {
    pdfDoc.getPage(pageNumber).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Add id to the canvas
        canvas.id = 'img_canvas';
       
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        const renderTask = page.render(renderContext);
        renderTask.promise.then(() => {
            pdfImageContainer.innerHTML = '';
            pdfImageContainer.appendChild(canvas);
            
            $('#img_canvas').css('max-width','-webkit-fill-available')

            const scale=1.5
            $('#img_canvas').Jcrop({
                onSelect: function(selected_coord){
                    console.log("coordinates ", selected_coord)
                   
                    // Transform Jcrop coordinates if needed
                    const transformedCoordinates = {
                        x: selected_coord.x/scale,
                        y: selected_coord.y/scale,
                        w: (selected_coord.x + selected_coord.w)/scale,
                        h: (selected_coord.y + selected_coord.h)/scale
                    };

                    data = JSON.stringify({
                        coordinates: transformedCoordinates,
                        pdf: file_name,
                        page: pageNumber
                        });

                        console.log(data);
                        const csrfToken = $('#csrf_token').val()
                        fetch('/get_data_coordinates', {
                        method: 'POST',
                        headers: {
                        // 'Content-Type': 'application/json/ multipart/form-data',
                        'X-CSRFToken': csrfToken,
                        },
                        body:data,
                        }).then(response => response.json())
                        .then(data => {
                        // Handle the API response data here
                        
                        console.log('Selected Words:', data.selected_words);
                        if(sourceId){
                            target_value.value = data.selected_words;

                            const coordinateString = JSON.stringify(data['coordinates']);
                            $(`#hide-coord-id-${fieldCount}`).val(coordinateString)

                            let temp_obj = {}
                            temp_obj.coordinate = JSON.parse(coordinateString);
                            temp_obj.label = $(`#label-${fieldCount}`).val();
                            temp_obj.text = $(`#input-${fieldCount}`).val();
                            temp_obj.page_no = pageNumber
                            
                            template_data_obj.push(temp_obj);
                             
                        }
                        })
                        .catch(error => {
                        console.error('Error:', error);
                        });
                }
            })

            // Add a class to the canvas element
            canvas.classList.add('border', 'border-dark', 'rounded');

        });
    });
}



function populatePageSelector(totalPages) {
    for (let i = 1; i <= totalPages; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Page ${i}`;
        pageSelector.appendChild(option);
    }
}

pageSelector.addEventListener('change', () => {
    const selectedPage = parseInt(pageSelector.value, 10);
    if (!isNaN(selectedPage) && selectedPage >= 1 && selectedPage <= pdfDoc.numPages) {
    currentPage = selectedPage;
    display_pdf_Image(currentPage);
    }
    });

// Load PDF and display first page as default
if (isPDF){
    pdfjsLib.getDocument(pdfFile).promise.then(pdf => {
            pdfDoc = pdf;
            const totalPages = pdf.numPages;
            populatePageSelector(totalPages);
            display_pdf_Image(currentPage);

            }).catch(error => console.error('Error loading PDF:', error));

}else{
        console.log("else part executed...")}
    
}

$('#templates-btn').on("click", function(event) {
    event.preventDefault();

    const temp_menu = $('#templates-menu');
    const temp_btn = $('#templates-btn');
    temp_menu.empty();
     
    fetch('/template', {
        method: 'GET',
        headers: {
        // 'Content-Type': 'application/json/ multipart/form-data',
        'X-CSRFToken': csrfToken,
        }, 
        }).then(response => response.json())
        .then(data => {
            data.forEach(option => {
                temp_menu.append(`<a class="dropdown-item" href="#" data-option="${option}">${option}</a>`);
              });
        })
        .catch(error => {
            console.error('Data fetching Error:', error);
            });

    // Event listener to handle when an option is clicked
    temp_menu.on('click', '.dropdown-item', function(event) {
        event.preventDefault();
        const selectedOption = $(this).data('option');
        console.log(`${selectedOption} option clicked`);
        temp_btn.text(selectedOption);

        mapping_label(selectedOption);
    });


}) 

function sendSelectedRectangle(x0, y0, x1, y1, pageno) {
    return new Promise((resolve, reject) => {
    const formData = new FormData();
   
    const transformedCoordinates = {
    x: x0,
    y: y0,
    w: x1,
    h: y1,
    };
   
    // Create the data object to send to the API
    const data = JSON.stringify({
    coordinates: transformedCoordinates,
    pdf: pdf_name,
    page: pageno,
    });
    
    fetch("/get_data_coordinates", {
    method: "POST",
    headers: {
    "X-CSRFToken": csrfToken,
    },
    body: data,
    })
    .then((response) => response.json())
    .then((data) => {
    
    resolve(data.selected_words);
    })
    .catch((error) => {
    console.error("Error:", error);
    reject(error);
    });
    });
   }

let fieldCount=0;
const inputContainer = document.getElementById('form-field')
const form_id = document.getElementById("form-id");
let sourceId='';
let target_value;  
let dataObject = {}

let obj={}       
function mapping_label(option){
     
    fetch(`/template?file_name=${option}`, {
        method: 'GET',
        headers: {
        'X-CSRFToken': csrfToken,
        }, 
        }).then(response => response.json())
        .then(data => { 
            let op = $('#templates-btn').text()
 
            create_form(data[op]);
        })
        .catch(error => {
            console.error('Data fetching Error:', error);
            });
        let template_data_obj=obj[pdf_name] = [];;
        function create_form(obj) {
            
            obj.forEach((item, index) => {
            const newRow = document.createElement("div");
            newRow.classList.add("row", "mb-2", "form-row");
            
            const labelColumn = document.createElement("div");
            labelColumn.classList.add("col-md-4");
            
            const inputColumn = document.createElement("div");
            inputColumn.classList.add("col-md-8");
            
            const newLabel = document.createElement("input");
            newLabel.for = `input-${fieldCount}`;
            newLabel.classList.add("form-control");
            newLabel.id = `label-${fieldCount}`;
            newLabel.style.color = "black";
            newLabel.placeholder = "Label Name";
            newLabel.value = item.label;
            
            // Create a new input field
            const newInput = document.createElement("input");
            newInput.type = "text";
            newInput.id = `input-${fieldCount}`;
            newInput.placeholder = "Extracted text";
            newInput.classList.add("form-control", "dynamic-input");
            newInput.setAttribute("aria-describedby", "passwordHelpInline");
            newInput.setAttribute("data-source", `input-${fieldCount}`);
            // Use Promise to get the extracted text and set it in the input field
            sendSelectedRectangle(item.coordinate.x, item.coordinate.y, item.coordinate.w, item.coordinate.h, item.page_no)
            .then((exttext) => {
                newInput.value = exttext; // Set the value here
                let temp_obj = {
                    coordinate: item.coordinate,
                    label: newLabel.value,
                    text: newInput.value,
                    page_no: item.page_no
                };
                template_data_obj.push(temp_obj);
            })
            .catch((error) => {
                console.error("Error getting extracted text:", error);
            });
            
            // create a new input tag for saving coordinates
            const coord = document.createElement("input");
            coord.id = `hide-coord-id-${fieldCount}`;
            coord.style.display = "none";
            coord.value = item.coordinates;
            coord.setAttribute("value", "");
            
            labelColumn.appendChild(newLabel);
            inputColumn.appendChild(newInput);
            // Append the new label and input field to the container
            newRow.appendChild(labelColumn);
            newRow.appendChild(inputColumn);
            newRow.appendChild(coord);
            
            form_id.appendChild(newRow);
            form_id.insertBefore(newRow, form_id.firstChild);
            inputContainer.appendChild(form_id);
 
            });
            $("#form-div-btn-id").css("display", "block");
            }
               
}

inputContainer.addEventListener('click', function (event) {
    if (event.target.classList.contains('dynamic-input')) {
       sourceId = event.target.getAttribute('data-source');
       target_value=event.target;

   
    }
   });
   $('#json-btn').on('click', function (event) {
    event.preventDefault();
    console.log("json download");
    // fetch(`/download?file_name=${}&format=json`)
    fetch(`/download?file_name=""&format=json`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json', // Add content type for POST
        },
        body: JSON.stringify(obj), // Send the dataObject as JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();
    })
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const fileName = 'data.json';
        a.download = fileName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});


$('#csv-btn').on('click', function(event) {
    event.preventDefault();
    console.log("csv click")
    fetch(`/download?file_name=""&format=csv`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json', // Add content type for POST
        },
        body:JSON.stringify(dataObject), // Send the dataObject as JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();
    })
    .then(blob => {

        const url = URL.createObjectURL(blob);

        // Create a link to trigger the download
        const a = document.createElement('a');
        a.href = url;
    
        // Define the CSV file name
        const fileName = 'data.csv';
        a.download = fileName;
    
        // Trigger the download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    })
    .catch(error => {
        console.error('Error:', error);
    });
    
});
