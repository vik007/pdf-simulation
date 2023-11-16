
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



$('#automate-btn').on("click", function(event) {
    event.preventDefault();
    $('#spinner').css("display","block");
    automateData(pdf_name);
});



let fieldCount=0;
const inputContainer = document.getElementById('form-field')
const form_id = document.getElementById("form-id");
let sourceId='';
let target_value;  
let obj = {}
            


inputContainer.addEventListener('click', function (event) {
    if (event.target.classList.contains('dynamic-input')) {
       sourceId = event.target.getAttribute('data-source');
       target_value=event.target;
   
    }
   });

$('#json-btn').on('click', function(event) {
event.preventDefault();
console.log("json download")
// fetch(`/download?file_name=${}&format=json`)
// Modify the API response to include the file name
fetch(`/download?file_name=""&format=json`, {
    method: 'POST',
    headers: {
        // 'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(obj),
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.blob(); // Get the response as a blob
})
.then(blob => {
    // Create a link to trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Set the desired file name for the download
    const fileName = 'data.csv';
    a.download = fileName;
    
    // Append the link to the body
    document.body.appendChild(a);

    // Simulate a click on the link to start the download
    a.click();

    // Remove the link from the body after download
    document.body.removeChild(a);
})
.catch(error => {
    console.error('Error:', error);
});
 
});

$('#csv-btn').on('click', function(event) {
    event.preventDefault();
    console.log("csv click")
    
});


function automateData(pdf_name) {
    const csrfToken = $('#csrf_token').val();
    // Create a FormData object to send the selected PDF file
    // Send a POST request to process the PDF
    fetch('/process_pdf', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
        },
        body: pdf_name,
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
            // Handle the error, display a message, or take appropriate action
        } else {
            // Process the answer received from the server
            console.log(data.answer);
            create_form(data.answer)
            $("#spinner").css("display", "none");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

    function create_form(obj) {
        for (const key in obj) {
            const newRow = document.createElement("div");
            newRow.classList.add("row", "mb-2", "form-row");
        
            const labelColumn = document.createElement("div");
            labelColumn.classList.add("col-md-4");
        
            const inputColumn = document.createElement("div");
            inputColumn.classList.add("col-md-8");
        
            const newLabel = document.createElement("label");
            newLabel.textContent = key; // Use the key as the label text
        
            // Create a new input field
            const newInput = document.createElement("input");
            newInput.type = "text";
            newInput.placeholder = "Extracted text";
            newInput.classList.add("form-control", "dynamic-input");
            newInput.setAttribute("aria-describedby", "passwordHelpInline");
            newInput.value = obj[key]; // Use the corresponding value as the input value
        
            // Append the label and input to their respective columns
            labelColumn.appendChild(newLabel);
            inputColumn.appendChild(newInput);
        
            // Append the columns to the new row
            newRow.appendChild(labelColumn);
            newRow.appendChild(inputColumn);
        
            // Finally, add the new row to your form or container
            form_id.appendChild(newRow);
        }
    }
}


function processImagesAndPDFs(formData) {
    const csrfToken = $('#csrf_token').val();

    // Send a POST request to process images and PDFs
    fetch('/extract-table', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
        },
        body: file.name,
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
            // Handle the error, display a message, or take appropriate action
        } else {
            // Process the answer received from the server for the second API
            let count =1;
            const para = document.createElement("h5");
            para.innerText="Line Items"
            form_id.appendChild(para);
            for (var i=0;i<data.message.page1.table_data.length;i++){
                const newRow = document.createElement("div");
                newRow.classList.add("row", "mb-2", "form-row");

                const inputColumn = document.createElement("div");
                inputColumn.classList.add("col-md-12");
                const newInput = document.createElement("input");
                newInput.type = "text";
                newInput.placeholder = "Extracted text";
                newInput.classList.add("form-control", "dynamic-input");
                newInput.setAttribute("aria-describedby", "passwordHelpInline");
                newInput.value = count+" - "+data.message.page1.table_data[i];
                inputColumn.appendChild(newInput);
                newRow.appendChild(inputColumn);
                // newRow.appendChild(textColumn);
                count++;
                
                form_id.appendChild(newRow);

                // console.log(data.message);
            }

            // Do something with the result if needed
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}