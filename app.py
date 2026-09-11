import os
import psycopg2
from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv
from datetime import datetime

# تحميل متغيرات البيئة من ملف .env
load_dotenv()

app = Flask(
    __name__,
    static_url_path='/sanaa-mashor2/static',
    static_folder='static',
    template_folder='templates'
)

# الحصول على متغيرات الاتصال بقاعدة البيانات
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

def get_db_connection():
    """إنشاء اتصال بقاعدة البيانات"""
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    return conn

def update_or_create_visitor(page_path):
    """تحديث أو إنشاء سجل زائر جديد"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # محاولة تحديث السجل الموجود
        cur.execute(
            "UPDATE visitor_count SET count = count + 1 WHERE page_path = %s RETURNING count",
            (page_path,)
        )
        updated_row = cur.fetchone()
        
        # إذا لم يتم تحديث أي صف، نقوم بإنشاء سجل جديد
        if not updated_row:
            cur.execute(
                "INSERT INTO visitor_count (page_path, count) VALUES (%s, 1) RETURNING count",
                (page_path,)
            )
            updated_row = cur.fetchone()
        
        conn.commit()
        return updated_row[0]
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

def get_visitor_count(page_path):
    """الحصول على عدد الزوار لصفحة محددة"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT count FROM visitor_count WHERE page_path = %s",
            (page_path,)
        )
        row = cur.fetchone()
        return row[0] if row else 0
    finally:
        cur.close()
        conn.close()
# ... الكود الحالي ...

@app.route('/api/reports/daily', methods=['GET'])
def get_daily_reports():
    municipality = request.args.get('municipality')
    year = request.args.get('year')
    month = request.args.get('month')
    day = request.args.get('day')

    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        query = """
        SELECT file_path
        FROM reports
        JOIN municipalities ON reports.municipality_id = municipalities.id
        JOIN report_types ON reports.report_type_id = report_types.id
        WHERE municipalities.slug = %s
        AND report_types.slug = 'daily'
        AND reports.year = %s
        AND reports.month = %s
        AND reports.day = %s
        """
        cur.execute(query, (municipality, year, month, day))
        report = cur.fetchone()
        
        if report:
            return jsonify({'file_path': report[0]})
        else:
            return jsonify({'error': 'Report not found'}), 404
            
    except Exception as e:
        app.logger.error(f"Error fetching daily report: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/reports/weekly', methods=['GET'])
def get_weekly_reports():
    municipality = request.args.get('municipality')
    year = request.args.get('year')
    month = request.args.get('month')
    week = request.args.get('week')

    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        query = """
        SELECT file_path
        FROM reports
        JOIN municipalities ON reports.municipality_id = municipalities.id
        JOIN report_types ON reports.report_type_id = report_types.id
        WHERE municipalities.slug = %s
        AND report_types.slug = 'weekly'
        AND reports.year = %s
        AND reports.month = %s
        AND reports.week = %s
        """
        cur.execute(query, (municipality, year, month, week))
        report = cur.fetchone()
        
        if report:
            return jsonify({'file_path': report[0]})
        else:
            return jsonify({'error': 'Report not found'}), 404
            
    except Exception as e:
        app.logger.error(f"Error fetching weekly report: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/reports/monthly', methods=['GET'])
def get_monthly_reports():
    municipality = request.args.get('municipality')
    year = request.args.get('year')
    month = request.args.get('month')

    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        query = """
        SELECT file_path
        FROM reports
        JOIN municipalities ON reports.municipality_id = municipalities.id
        JOIN report_types ON reports.report_type_id = report_types.id
        WHERE municipalities.slug = %s
        AND report_types.slug = 'monthly'
        AND reports.year = %s
        AND reports.month = %s
        """
        cur.execute(query, (municipality, year, month))
        report = cur.fetchone()
        
        if report:
            return jsonify({'file_path': report[0]})
        else:
            return jsonify({'error': 'Report not found'}), 404
            
    except Exception as e:
        app.logger.error(f"Error fetching monthly report: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/reports/other', methods=['GET'])
def get_other_reports():
    municipality = request.args.get('municipality')

    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        query = """
        SELECT file_path
        FROM reports
        JOIN municipalities ON reports.municipality_id = municipalities.id
        JOIN report_types ON reports.report_type_id = report_types.id
        WHERE municipalities.slug = %s
        AND report_types.slug = 'other'
        """
        cur.execute(query, (municipality,))
        reports = cur.fetchall()
        
        if reports:
            # إرجاع جميع التقارير المتاحة
            file_paths = [report[0] for report in reports]
            return jsonify({'file_paths': file_paths})
        else:
            return jsonify({'error': 'Reports not found'}), 404
            
    except Exception as e:
        app.logger.error(f"Error fetching other reports: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cur.close()
        conn.close()

# ... بقية الكود الحالي ...
@app.route('/api/visitors', methods=['POST', 'GET'])
def handle_visitors():
    try:
        page = None
        
        if request.method == 'POST':
            # التحقق من وجود بيانات JSON
            if not request.is_json:
                return jsonify({'error': 'Missing JSON in request'}), 400
                
            data = request.get_json()
            if not data or 'page' not in data:
                return jsonify({'error': 'Missing page parameter'}), 400
                
            page = data['page']
            
            # توحيد شكل المسار
            if page != '/':
                page = page.rstrip('/')
            
            count = update_or_create_visitor(page)
            return jsonify({'count': count})
        
        elif request.method == 'GET':
            page = request.args.get('page')
            if not page:
                return jsonify({'error': 'Missing page parameter'}), 400
            
            # توحيد شكل المسار
            if page != '/':
                page = page.rstrip('/')
            
            count = get_visitor_count(page)
            return jsonify({'count': count})
    
    except Exception as e:
        app.logger.error(f"Error handling visitor request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)