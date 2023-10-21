from flask import Blueprint, render_template, request, jsonify, send_from_directory, redirect, url_for, send_file
from jinja2 import TemplateNotFound
import os
from werkzeug.utils import secure_filename
from config import Config
import json, fitz, cv2
from flask import Response 
from io import StringIO
import csv
from transformers import pipeline, AutoTokenizer, AutoModelForDocumentQuestionAnswering
from pdf2image import convert_from_path
import pytesseract

selected_data = []
data_dict = dict()
template_folder="pdf_templates"

bp = Blueprint('main', __name__) 

# Base Routes
@bp.route('/')
def pdf_annoted():
    return render_template('home/annoted.html', segment='annoted',aman="aman jsihsib" )

@bp.route('/automate')
def pdf_automate():
    return render_template('home/automate.html', segment='automate')
 
@bp.route('/apply-template')
def apply_template():
    return render_template('home/pdf_template.html', segment='template')

# Annoted section Routes
@bp.route('/display', methods = ['POST'])
def display():
    file = request.files.get('file')

    if not file:
        return "No file provided", 400

    # Assuming Config.UPLOAD_PATH is the directory where the files are stored
    file_path = os.path.join(Config.UPLOAD_PATH, secure_filename(file.filename))
    file.save(file_path)

    # Send the file as a response
    return send_file(file_path)


@bp.route('/get_data_coordinates', methods=['POST'])
def get_data_coordinates_api():
    data = request.get_json(request.data)
    coordinates = data['coordinates']

    x0 = coordinates['x']
    y0 = coordinates['y']
    x1 = coordinates['w']
    y1 = coordinates['h']

    pdf_name = data['pdf']
    page_num = data['page']

    # You can now access the parsed values
    selected_words = []

    # Determine the file extension using endswith function
    if pdf_name.lower().endswith('.pdf') and page_num is not None:

        pdf_path = os.path.join(Config.UPLOAD_PATH, secure_filename(pdf_name))
        pdf_document = fitz.open(pdf_path)
        page=pdf_document.load_page(page_num-1)

        words_data = page.get_text("words")
    
        start_x, end_x = sorted([x0, x1])
        start_y, end_y = sorted([y0, y1])
        user_bbox = fitz.Rect(start_x, start_y, end_x, end_y)

        for word_info in words_data:
            word_text = word_info[4]
            word_bbox = fitz.Rect(word_info[:4])
            if word_bbox.intersects(user_bbox):
                # print(word_text)
                selected_words.append(word_text)
        if selected_words:
            return {"coordinates": coordinates, "selected_words": " ".join(word.strip() for word in selected_words)}

    else:
        
        print("else part executed....")
        #  # Handle image coordinates
        # image_name = pdf_name  # Assuming image file has same name as pdf
        # breakpoint()
        # image_path = os.path.join(Config['UPLOAD_PATH'], secure_filename(image_name))
        # # Extract text from the specified coordinates in the image
        # extracted_text = extract_text_from_image(image_path, coordinates)

        # return {"selected_words": extracted_text}


    return {"selected_words": "No data to be extract!!!"}
 

filename = "data.json"
file_path = os.path.join(template_folder, filename)
@bp.route('/template', methods=['POST','GET']) #localhost:8000/template?file_name=nitesh
def save_template():

    if request.method == 'POST':
        data = request.get_json(request.data)

        pdf_name = list(data.keys())[0] 
        data_to_save = data[pdf_name]
        
        # Check if the 'template' folder exists, and create it if not
        if not os.path.exists(template_folder):
            os.makedirs(template_folder)
        
        # if filename is empty to fill data :
        if os.path.getsize(file_path) == 0:
            with open(file_path, "w") as file:
                json.dump(data, file, indent=4)
            
            return jsonify({"message": "new file created succesfully!!!"}), 200

        # Read existing data from the file
        existing_data = {}
        with open(file_path, "r") as file:
            existing_data = json.load(file)
        
        # Check if the PDF name already exists
        if pdf_name in existing_data: 
            # Append the new data to the existing PDF data
            for data in data_to_save:
                existing_data[pdf_name].append(data)
        else:
            # Create a new entry for the PDF
            existing_data[pdf_name] = data_to_save

        # Write the updated data to the file
        with open(file_path, "w") as file:
            json.dump(existing_data, file, indent=4)

        return jsonify({"message": "update file Success"})
    
    if request.method == 'GET':
        if os.path.exists(file_path):
            with open(file_path, "r") as file:
                data = json.load(file)

            pdf_name = request.args.get('file_name')
            if pdf_name:
                if pdf_name in data:
                    return jsonify({pdf_name: data[pdf_name]}), 200
                else:
                    return jsonify({"error": "PDF not found"}), 404
            else: 
                return jsonify(list(data.keys())), 200
        else:
            return jsonify({"error": "File not found there is no template found...."}), 404
 
def initilise_data(data):
    rows=[]
    # Initialize lists to store the data 
    for pdf, entries in data.items():
        for entry in entries:
            
            text = entry["text"]
            label = entry["label"]
            page_no = entry["page_no"]
            rows.append({
                "Label": label,
                "Extracted data": text,
                "Page_no": page_no})
    return rows

@bp.route('/download', methods=['POST', 'GET']) #localhost:8000/download?file_name=aman&format=json
def download_file(): 
    if request.method == 'GET':
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found. There is no template found."}), 404

        with open(file_path, "r") as file:
            data = json.load(file)

        pdf_name = request.args.get('file_name')
        formate = request.args.get('format').lower()
    

        if formate:
            
                rows = initilise_data(data)

                if formate == "json":
    
                    # Return the data for the specified PDF
                    return Response(str(rows), 
                mimetype='application/json',
                headers={'Content-Disposition':f'attachment;filename={filename}'})

                # return jsonify({pdf_name: data[pdf_name]}), 200
                if formate == "csv":

                    # Create a DataFrame
                    # Define CSV header and rows
                    csv_header = ["Label", "Extracted data", "Page_no"]
                    csv_rows = [[row["Label"], row["Extracted data"], row["Page_no"]] for row in rows]
                    
                    # Create a string buffer to hold CSV data
                    csv_buffer = StringIO()
                    csv_writer = csv.writer(csv_buffer)
                    csv_writer.writerow(csv_header)
                    csv_writer.writerows(csv_rows)

                    # Prepare the response with CSV data
                    response = Response(csv_buffer.getvalue(), mimetype='text/csv')
                    response.headers.set('Content-Disposition', f'attachment;filename={filename}.csv')

                    return response

        else:
            return jsonify({"error": f"PDF formate not found of {pdf_name}"}), 404
        
    
    if request.method == 'POST':
        breakpoint()
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided in the request body"}), 400
        
        
        formate = request.args.get('format').lower()

        if formate:
           
            rows = initilise_data(data)

            if formate == "json":
    
                # Return the data for the specified PDF
                return Response(str(rows), 
                mimetype='application/json',
                headers={'Content-Disposition':f'attachment;filename={filename}'})

            # return jsonify({pdf_name: data[pdf_name]}), 200
            if formate == "csv":

                # Create a DataFrame
                # Define CSV header and rows
                csv_header = ["Label", "Extracted data", "Page_no"]
                csv_rows = [[row["Label"], row["Extracted data"], row["Page_no"]] for row in rows]
                
                # Create a string buffer to hold CSV data
                csv_buffer = StringIO()
                csv_writer = csv.writer(csv_buffer)
                csv_writer.writerow(csv_header)
                csv_writer.writerows(csv_rows)

                # Prepare the response with CSV data
                response = Response(csv_buffer.getvalue(), mimetype='text/csv')
                response.headers.set('Content-Disposition', f'attachment;filename={filename}.csv')

                return response

            else:
                return jsonify({"error": f"PDF not found of {pdf_name}"}), 404
        



# Apply Template section Routes

pipe = pipeline("document-question-answering", model="impira/layoutlm-invoices")

# Load the LayoutLM tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("impira/layoutlm-invoices")
model = AutoModelForDocumentQuestionAnswering.from_pretrained("impira/layoutlm-invoices")

# Detect Automation Route
@bp.route('/process_pdf', methods=['POST'])
def process_pdf():

    pdf_filename = request.data.decode('utf-8')
    file_path = os.path.join(Config.UPLOAD_PATH, secure_filename(pdf_filename))
   
    if pdf_filename.endswith('.pdf'):
        # Convert PDF to images
        images = convert_from_path(file_path)
        
        # Extract text from images using OCR
        extracted_text = '\n'.join([pytesseract.image_to_string(img) for img in images])
        
        # Question to ask the LayoutLM model
        questions = {
        "Exporter/Exportateur": "Who is the exporter?",
        "Exporter EORI No.": "What is the EORI No.?",
        "Exporter Address": "What is the address?",
        "Exporter City": "What is the city?",
        "Exporter Zip Code": "What is the zip code?",
        "Exporter Country": "What is the country?",
        "Importer/Importateur": "Who is the importer?",
        "Importer Consignee": "Who is the consignee?",
        "Importer VAT No.": "What is the VAT No.?",
        "Document ID": "What is the document ID?",
        "Document Date": "What is the date of the document?",
        "Country Dispatch": "What is the country of dispatch?",
        "Incoterms": "What are the Incoterms used in the document?",
        "City of Delivery":" What is the city of delivery?",
        # "Commodity code": "What is the commodity code in the document?",
        "Final Destination": "What is the final destination mentioned?",
        "Total Gross Weight": "What is the total gross weight?"
    }
        field_values = {}
        # Use the LayoutLM pipeline to answer the question
        for field, question in questions.items():
            result = pipe(question=question, context=extracted_text,image=images[0])
            if result[0]['score']>0.01:
                field_values[field] = result[0]["answer"]
                answer = result[0]["answer"]
            else:
                field_values[field] = " "
                answer = " "
        
        return jsonify({"answer": field_values})
    
    return jsonify({"error": "Invalid or unsupported file format"})