= Methodology

== System Design
The proposed Real-Time Smart Parking Billing System Using YOLO and OCR is designed to automate vehicle entry, exit, and billing using ANPR. The system captures vehicle images, detects license plates using deep learning models, extracts alphanumeric characters through OCR, and calculates parking charges based on the duration of stay. The overall system emphasizes automation, accuracy, and minimal human intervention.

#figure(
  image("images/system-design.png", width: 100%),
  caption: [System Design of the Proposed ANPR-Based Parking System]
)

== Proposed Block Diagram
The block diagram illustrates the workflow of the system from image acquisition to billing generation. It shows the interaction between the camera input, preprocessing module, license plate detection, character recognition, database storage, and web-based dashboard.

#figure(
  image("images/Proposed Block Diagram.png", width: 83%),
  caption: [Block Diagram of the Proposed System]
)
#pagebreak()
== Tools and Technologies

=== Programming Language
*Python* is used as the primary programming language for system development due to its simple syntax, readability, and strong support for computer vision and deep learning frameworks.

=== Libraries and Frameworks
- *OpenCV*: Used for image acquisition and basic image preprocessing tasks such as grayscale conversion, noise reduction, resizing, and thresholding.
- *Ultralytics YOLO*: Used for real-time license plate detection because of its high speed and accuracy.
- *TensorFlow / Keras or PyTorch*: Used for implementing CNN-based models for character recognition.
- *Tesseract OCR*: Used to extract alphanumeric characters from detected license plate images.
- *NumPy*: Used for numerical operations and efficient handling of image and model data.
- *Pandas*: Used for managing structured data such as recognized plate numbers, timestamps, and billing records.

=== Database
*MongoDB or PostgreSQL* is used to store vehicle information, entry and exit timestamps, and parking billing records in a structured and reliable manner.

=== Web Technologies
- *FastAPI*: Used to develop backend APIs for data processing and communication between system modules.
- *HTML, CSS, JavaScript*: Used to design and add interactivity to the web-based user interface.
- *React*: Used to develop a dynamic and responsive frontend for real-time display of vehicle and billing information.

== Techniques / Workflow
1. *Data Collection*:  
   License plate images are collected manually and from publicly available datasets to support system training and testing.

2. *Pre-processing*:  
   Collected images are preprocessed using grayscale conversion, noise reduction, resizing, and thresholding to improve recognition accuracy.

3. *License Plate Detection*:  
   YOLO is applied to detect and localize license plates from vehicle images in real time.

4. *Character Recognition*:  
   Cropped license plate regions are processed using CNN-based models and Tesseract OCR to extract alphanumeric characters.

5. *Billing Calculation*:  
   Vehicle entry and exit times are recorded, and parking charges are calculated based on the duration of stay.

6. *Web Dashboard*:  
   Vehicle details, timestamps, and billing information are displayed through a web-based dashboard for monitoring and management.

== Data Source
The dataset consists of Nepali vehicle number plate images collected from publicly available sources and manual image collection to reflect real-world variations. The data is used solely for academic and experimental purposes.

#columns(2, gutter: 1cm)[
  #figure(
    image("images/numberplate1.png", width: 100%),
    caption: [ Sample Number Plate 1 ]
  )

  #figure(
    image("images/numberplate2.png", width: 100%),
    caption: [ Sample Number Plate 2 ]
  )
]