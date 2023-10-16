<!-- virtual environment in project -->
python3 -m venv pdf_env

source pdf_env/bin/activate

deactivate

pip install -r requirement.txt


< PROJECT ROOT >
   |
   |-- apps/
   |    |
   |    |-- __init__.py                           
   |    |-- model.py                 
   |    |-- routes.py                       
   |    |                  
   |-- static/
   |    |-- assets<css, js, img>          
   |    |-- uploads
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
   |                        
   |
   |-- requirements.txt                     
   |
   |-- .env                                 
   |-- main.py                               
   |
   |-- ************************************************************************
```