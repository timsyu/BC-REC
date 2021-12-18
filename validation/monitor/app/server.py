import io
import os
from flask import Flask, request
from flask import Response
from analysis import Analysis
from flask import render_template
from werkzeug.utils import safe_join
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import requests
import base64
import json
from flask import jsonify

app = Flask(__name__)
static = safe_join(os.path.dirname(__file__), 'static')

@app.route('/')
def hello_world():
    return render_template('structure.html')

@app.route('/home')
def home():
    return render_template('home.html')

def getRecordTimeInfo(url, number):
    r = requests.get(url, number)
    content = ''
    if r.status_code == requests.codes.ok:
        result = r.json()
        if result['success'] == True:
            content = base64.b64decode(result['content']).decode('utf-8')
    return content

@app.route('/distribution')
def distribution():
    data = '{"result":false, "org_device_distribution":"", "org_plant_distribution":""}'
    data = json.loads(data)
    try:
        f = open('/opt/distribution/org_device_distribution.json')
        content = json.load(f)
        data['org_device_distribution'] = content
        f = open('/opt/distribution/org_plant_distribution.json')
        content = json.load(f)
        data['org_plant_distribution'] = content
        data['result'] = True
    except OSError:
        pass
    return jsonify(data)

@app.route('/img/recordtime.png')
def out():
    servicename = request.args.get('servicename')
    number = request.args.get('num')
    content = getRecordTimeInfo("http://" + servicename + ":3000/out/recordtime", number)
    data = content.split(',')
    a = Analysis()
    plt = a.draw(data=data, toInt=True, draw=True)
    output = io.BytesIO()
    canvas = FigureCanvas(plt.gcf())
    png_output = io.BytesIO()
    canvas.print_png(output)
    return Response(output.getvalue(), mimetype='image/png')

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=3000)