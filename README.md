# PDF Simulation
This project is a Flask application that facilitates the extraction of data from uploaded PDFs. Users can upload PDF files, select specific areas within the PDF using OCR APIs to extract data, and then map the extracted data to corresponding labels. The extracted data and mappings can be downloaded in JSON and CSV file formats. The project also includes an automated section, allowing users to streamline the extraction process by assigning labels to automatically extracted data, ultimately improving efficiency and saving time.

## Features :

   - Upload PDF files.
   - Select specific areas within PDFs for data extraction.
   - Utilize OCR APIs to extract data from selected areas.
   - Map extracted data to predefined labels.
   - Download extracted data and mappings in JSON and CSV file formats.
   - Automated data extraction with labeling for improved efficiency.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Installation

Clone the repository:
```
git clone https://github.com/vik007/pdf-simulation.git
cd pdf-simulation
```
#### Create Virtual Environment for Project 
pdf_env is the virtual environment name you can change also :
```
python3 -m venv pdf_env
```

Activate the environment for setup project :
```
source pdf_env/bin/activate
```

If you want to out from environment :
```
deactivate
```

Install all requirement modules check environment is activate :
```
pip install -r requirements.txt
```

#### Run the Project 
```
python3 main.py
```

 

## PROJECT FOLDER STRUCTURE 
   |
   |-- app/
   |    |
   |    |-- __init__.py                           
   |    |-- model.py                 
   |    |-- routes.py                       
   |    |                  
   |-- static/
   |    |-- assets<css, js, img>          
   |    |-- uploads
   |    |
   |-- pdf_templates/
   |    |-- data.json
   |    |
   |-- templates/                      
   |    |-- includes/                  
   |    |    |-- navigation.html       
   |    |    |-- sidebar.html          
   |    |    |-- footer.html           
   |    |    |-- scripts.html          
   |    |
   |    |-- layouts/                   
   |    |    |-- base.html              
   |    |        
   |    |-- home/                      
   |    |         |-- annoted.html            
   |    |         |-- automate.html         
   |    |                 
   |    |    
   |-- config.py                             
   |-- .gitignore                     
   |
   |-- requirements.txt                     
   |-- run.sh
   |-- README.md
   |-- .env                                 
   |-- main.py                               
   |
 
