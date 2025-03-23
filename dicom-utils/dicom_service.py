from flask import Flask, request, send_file, jsonify
import pydicom
from pydicom.dataset import Dataset
from io import BytesIO
import json
import os

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024

def load_custom_tag_config():
    config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'metadata_files', 'custom_tag_config.json')
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading custom tag config: {e}")
        return {"customTagConfig": {"tags": []}}

def apply_custom_tags(ds, doctor_uid):
    # Usar el tag estándar DICOM para Referring Physician Name
    ds.add_new(0x00080090, 'PN', doctor_uid)
    print(f"Added Referring Physician Name tag with value: {doctor_uid}")
    
    # Verificar que el tag fue agregado
    if 0x00080090 in ds:
        print(f"Verified Referring Physician Name tag exists with value: {ds[0x00080090].value}")
    else:
        print("Warning: Referring Physician Name tag was not added successfully")

def extract_metadata(ds):
    metadata = {}
    fields = [
        'SOPInstanceUID', 'SeriesInstanceUID', 'StudyInstanceUID',
        'PatientID', 'PatientName', 'StudyDate', 'Modality',
        'ImageLaterality', 'ViewPosition'
    ]
    for field in fields:
        value = ds.get(field, None)
        if value is not None:
            metadata[field] = str(value)
    
    # Agregar el doctor UID a los metadatos
    if 0x00080090 in ds:
        metadata['DoctorUID'] = str(ds[0x00080090].value)
    else:
        metadata['DoctorUID'] = None
        
    return metadata

@app.route('/extract-metadata', methods=['POST'])
def extract_dicom_metadata():
    if 'dicom_file' not in request.files:
        return jsonify({'error': 'No dicom file provided'}), 400

    doctor_uid = request.args.get('doctor_uid')
    if not doctor_uid:
        return jsonify({'error': 'No doctor UID provided'}), 400

    format_type = request.args.get('format', 'json')

    dicom_file = request.files['dicom_file']
    try:
        dicom_bytes = dicom_file.read()
        ds = pydicom.dcmread(BytesIO(dicom_bytes), force=True)
        
        # Apply custom tags from configuration
        apply_custom_tags(ds, doctor_uid)
        
        metadata = extract_metadata(ds)

        # Create a new BytesIO object for the modified DICOM file
        modified_dicom_buffer = BytesIO()
        ds.save_as(modified_dicom_buffer)
        modified_dicom_buffer.seek(0)

        if format_type == 'txt':
            txt_buffer = BytesIO()
            txt_buffer.write(json.dumps(metadata, indent=2).encode('utf-8'))
            txt_buffer.seek(0)
            return send_file(
                txt_buffer,
                mimetype='text/plain',
                as_attachment=True,
                download_name='metadata.txt'
            )

        # Return both metadata and modified DICOM file
        return jsonify({
            'metadata': metadata,
            'dicom_file': modified_dicom_buffer.getvalue().hex()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
