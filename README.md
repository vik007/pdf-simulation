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
   ```
   |-- app/
   |    --authentication/
   |        |--__init__.py 
   |        |-- model.py 
   |        |-- routes.py 
   |        |-- forms.py 
   |        |
   |    --home/
   |        |-- __init__.py                           
   |        |-- model.py                 
   |        |-- routes.py                       
   |        |                  
   |    -- static/
   |        |-- assets<css, js, img>          
   |        |-- uploads
   |        |
   |    -- templates/                      
   |        |-- includes/                  
   |        |    |-- navigation.html       
   |        |    |-- sidebar.html          
   |        |    |-- footer.html           
   |        |    |-- scripts.html          
   |        |
   |        |-- layouts/                   
   |        |    |-- base.html              
   |        |        
   |        |-- home/                      
   |        |    |-- annoted.html            
   |        |    |-- automate.html         
   |        |    |-- page-403.html
   |        |    |-- pdf_template.html
   |        |
   |        |--accounts/
   |        |    |-- login.html
   |        |    |-- register.html
   |        |
   |        |    
   |    -- config.py
   |    --__init__.py                          
   |-- .gitignore                     
   |--pdf_templates/
   |        |--data.json
   |-- requirements.txt                     
   |-- run.sh
   |-- README.md
   |-- .env                                 
   |-- main.py                               
   ```
 
## Directory Descriptions

   - app/: Contains files related to the Flask application.
   - static/assets/: Contains static assets such as CSS, JS, and images.
   - uploads/: Directory for uploaded files and data storage.
   - includes/: Templates and layout components for the application.
   - home/: Contains HTML templates for specific pages.
   - config.py: Configuration file for the application.
   - .gitignore: Git configuration to ignore specified files.
   - requirements.txt: List of Python dependencies for the project.
   - run.sh: Shell script to run the application.
   - README.md: Project documentation.
   - .env: Environment variables configuration file.
   - main.py: Main Python file for running the application.
