from flask import Flask, request, send_file, jsonify
import pydicom
from io import BytesIO
import json

app = Flask(__name__)

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
    return metadata

@app.route('/extract-metadata', methods=['POST'])
def extract_dicom_metadata():
    if 'dicom_file' not in request.files:
        return jsonify({'error': 'No dicom file provided'}), 400

    format_type = request.args.get('format', 'json')

    dicom_file = request.files['dicom_file']
    try:
        dicom_bytes = dicom_file.read()
        ds = pydicom.dcmread(BytesIO(dicom_bytes), force=True)
        metadata = extract_metadata(ds)

        if format_type == 'txt':
            # Prepara el archivo .txt con la metadata
            txt_buffer = BytesIO()
            txt_buffer.write(json.dumps(metadata, indent=2).encode('utf-8'))
            txt_buffer.seek(0)

            return send_file(
                txt_buffer,
                mimetype='text/plain',
                as_attachment=True,
                download_name='metadata.txt'
            )

        # Por defecto, retorna JSON
        return jsonify(metadata)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
