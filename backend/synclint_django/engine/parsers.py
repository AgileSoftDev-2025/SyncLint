# File: engine/parsers.py (VERSI FINAL LENGKAP - PERBAIKAN SEMUA PARSER)

import json
import sqlparse 
import lxml.etree as ET
import spacy 
import re 

# Muat model spacy sekali
NLP = spacy.load("en_core_web_sm")

# -----------------------------------------------------------------
# FUNGSI UTAMA
# -----------------------------------------------------------------
def parse_artifact_file(artefak_instance):
    file_path = artefak_instance.file.path
    artifact_type = artefak_instance.type
    
    parsed_data = {} 

    try:
        read_mode = 'r'
        encoding = 'utf-8'
        # Tipe file XML/XMI dibaca sebagai binary ('rb')
        if artifact_type in ['BPMN', 'CLASS_DIAGRAM', 'USE_CASE_DIAGRAM', 'ACTIVITY_DIAGRAM', 'SEQUENCE_DIAGRAM']:
             read_mode = 'rb'
             encoding = None
            
        with open(file_path, read_mode, encoding=encoding) as f:
            content = f.read()
        
        # --- Di sinilah Logika Parsing Anda Bekerja ---
        
        if artifact_type == 'SQL_DDL':
            parsed_data = parse_sql(content)
        
        elif artifact_type == 'BPMN':
            parsed_data = parse_bpmn(content) 
            
        elif artifact_type == 'CLASS_DIAGRAM':
            parsed_data = parse_class_diagram(content)
        
        elif artifact_type == 'USE_CASE_DIAGRAM': 
            parsed_data = parse_use_case_diagram(content) 
        
        elif artifact_type == 'ACTIVITY_DIAGRAM': 
            parsed_data = parse_activity_diagram(content) 
        
        elif artifact_type == 'SEQUENCE_DIAGRAM': 
            parsed_data = parse_sequence_diagram(content) 

        elif artifact_type == 'USE_CASE_SPEC': 
            parsed_data = parse_use_case_spec(content) 

        elif artifact_type == 'WIREFRAME_SALT': 
            parsed_data = parse_wireframe_salt(content)
            
        else:
            raise ValueError(f"Tipe artefak tidak dikenal: {artifact_type}")

        # --- Simpan hasil parsing (dict) ke JSONField ---
        artefak_instance.filejson = parsed_data
        artefak_instance.save()
        
        return True, "Parsing berhasil"

    except Exception as e:
        print(f"Error parsing file {file_path}: {e}")
        return False, str(e)

# -----------------------------------------------------------------
# PARSER SPESIFIK (SQL DDL) - VERSI PERBAIKAN FINAL
# -----------------------------------------------------------------
def parse_sql(content):
    """
    Mem-parsing skrip SQL DDL. Versi ini jauh lebih sederhana dan
    menggunakan string splitting, bukan token.
    """
    parsed_json = {"artifact_type": "SQL_DDL", "tables": []}
    statements = sqlparse.parse(content)

    for stmt in statements:
        if stmt.get_type() != 'CREATE':
            continue

        stmt_str = str(stmt).upper()
        if 'TABLE' not in stmt_str:
            continue
            
        try:
            # Dapatkan nama tabel
            table_name = re.search(r'TABLE\s+`?(\w+)`?', stmt_str).group(1)
            table_info = {"name": table_name, "columns": [], "constraints": {}}
            
            # Dapatkan semua di antara ( dan )
            columns_str = re.search(r'\(([\s\S]*)\)', str(stmt)).group(1)
            
            # Pisahkan per baris
            for line in columns_str.split('\n'):
                line = line.strip().strip(',')
                if not line:
                    continue

                line_upper = line.upper()

                # Lewati constraint level tabel
                if line_upper.startswith('PRIMARY KEY') or \
                   line_upper.startswith('FOREIGN KEY') or \
                   line_upper.startswith('UNIQUE') or \
                   line_upper.startswith('CONSTRAINT') or \
                   line_upper.startswith('CHECK'):
                    continue
                
                # Ini adalah definisi kolom
                parts = line.split()
                if len(parts) < 2:
                    continue
                    
                col_name = parts[0].strip('`')
                col_type = parts[1]
                
                # Tangani tipe data seperti VARCHAR(100)
                if 'VARCHAR' in col_type:
                    col_type = re.search(r'VARCHAR\(\d+\)', line_upper, re.IGNORECASE).group(0)

                col_data = {
                    "name": col_name,
                    "data_type": col_type,
                    "constraints": {}
                }

                if 'PRIMARY KEY' in line_upper:
                    col_data["constraints"]["primary_key"] = True
                if 'NOT NULL' in line_upper:
                    col_data["constraints"]["not_null"] = True
                if 'UNIQUE' in line_upper:
                    col_data["constraints"]["unique"] = True
                
                table_info["columns"].append(col_data)
                
            parsed_json["tables"].append(table_info)

        except Exception as e:
            print(f"Gagal mem-parsing statement SQL: {e}")
            
    return parsed_json

# -----------------------------------------------------------------
# PARSER SPESIFIK (CLASS DIAGRAM) - PERBAIKAN NAMESPACE
# -----------------------------------------------------------------
def parse_class_diagram(xml_content):
    parsed_json = {"artifact_type": "CLASS_DIAGRAM", "classes": [], "relationships": []}
    try:
        ns = {'uml': 'http://www.omg.org/spec/UML/20131001',
              'xmi': 'http://www.omg.org/spec/XMI/20131001'}
        
        if xml_content.startswith(b'\xef\xbb\xbf'):
            xml_content = xml_content[3:]
        root = ET.fromstring(xml_content)
        
        class_id_map = {}
        for pkg_element in root.xpath('//packagedElement[@xmi:type="uml:Class"]', namespaces=ns):
            class_id = pkg_element.get(f'{{{ns["xmi"]}}}id')
            class_name = pkg_element.get('name')
            if class_id:
                class_id_map[class_id] = class_name

        for pkg_element in root.xpath('//packagedElement[@xmi:type="uml:Class"]', namespaces=ns):
            class_data = {"name": pkg_element.get('name'), "attributes": [], "methods": []}
            for attr in pkg_element.xpath('./ownedAttribute[@xmi:type="uml:Property"]', namespaces=ns):
                attr_data = {"name": attr.get('name'), "visibility": attr.get('visibility', 'public')}
                type_element = attr.find('type', namespaces=ns)
                attr_data["type"] = type_element.get('href') if type_element is not None else "undefined"
                class_data["attributes"].append(attr_data)
            for op in pkg_element.xpath('./ownedOperation[@xmi:type="uml:Operation"]', namespaces=ns):
                op_data = {"name": op.get('name'), "visibility": op.get('visibility', 'public'), "parameters": []}
                for param in op.xpath('./ownedParameter', namespaces=ns):
                    param_data = {"name": param.get('name'), "direction": param.get('direction', 'in')}
                    if param_data["direction"] == "return":
                        op_data["return_type"] = param.get('type', 'void')
                    else:
                        op_data["parameters"].append(param_data)
                class_data["methods"].append(op_data)
            parsed_json["classes"].append(class_data)
            
        for assoc in root.xpath('//packagedElement[@xmi:type="uml:Association"]', namespaces=ns):
            ends = assoc.xpath('./ownedEnd', namespaces=ns)
            if len(ends) == 2:
                try:
                    source_id = ends[0].find('type', namespaces=ns).get(f'{{{ns["xmi"]}}}idref')
                    target_id = ends[1].find('type', namespaces=ns).get(f'{{{ns["xmi"]}}}idref')
                    rel_data = {
                        "type": "association",
                        "source_class": class_id_map.get(source_id, source_id),
                        "target_class": class_id_map.get(target_id, target_id)
                    }
                    parsed_json["relationships"].append(rel_data)
                except AttributeError:
                    pass
        return parsed_json
    except ET.ParseError as e:
        print(f"XML Parse Error: {e}")
        return {"error": "File XMI tidak valid atau rusak.", "detail": str(e)}
    except Exception as e:
        print(f"Error parsing Class Diagram: {e}")
        return {"error": "Gagal memproses Class Diagram.", "detail": str(e)}

# -----------------------------------------------------------------
# PARSER SPESIFIK (BPMN) - PERBAIKAN NAMESPACE
# -----------------------------------------------------------------
def parse_bpmn(xml_content):
    parsed_json = {"artifact_type": "BPMN", "processes": []}
    try:
        if xml_content.startswith(b'\xef\xbb\xbf'):
            xml_content = xml_content[3:]
        root = ET.fromstring(xml_content)
        
        # Coba namespace ber-prefix
        ns_prefixed = {'bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL'}
        processes = root.xpath('//bpmn:process', namespaces=ns_prefixed)
        ns_prefix_xpath = "bpmn:"
        ns_to_use = ns_prefixed
        
        # Jika tidak ditemukan, coba namespace default
        if not processes:
            ns_default = {'': 'http://www.omg.org/spec/BPMN/20100524/MODEL'}
            processes = root.xpath('//:process', namespaces=ns_default)
            ns_prefix_xpath = ":"
            ns_to_use = ns_default

        for process in processes:
            process_data = {"id": process.get('id'), "name": process.get('name', 'Process'), "pools": [], "lanes": [], "flow_objects": [], "sequence_flows": []}
            for lane_set in process.xpath(f'./{ns_prefix_xpath}laneSet', namespaces=ns_to_use):
                process_data["pools"].append(lane_set.get('name', 'Default Pool'))
                for lane in lane_set.xpath(f'./{ns_prefix_xpath}lane', namespaces=ns_to_use):
                    process_data["lanes"].append({"id": lane.get('id'), "name": lane.get('name')})
            flow_object_tags = ['task', 'userTask', 'serviceTask', 'startEvent', 'endEvent', 'exclusiveGateway', 'parallelGateway', 'subProcess']
            for tag in flow_object_tags:
                for element in process.xpath(f'./{ns_prefix_xpath}{tag}', namespaces=ns_to_use):
                    process_data["flow_objects"].append({"id": element.get('id'), "type": element.tag.split('}')[-1], "name": element.get('name', '')})
            for flow in process.xpath(f'./{ns_prefix_xpath}sequenceFlow', namespaces=ns_to_use):
                process_data["sequence_flows"].append({"id": flow.get('id'), "name": flow.get('name', ''), "source": flow.get('sourceRef'), "target": flow.get('targetRef')})
            parsed_json["processes"].append(process_data)
        return parsed_json
    except ET.ParseError as e:
        print(f"XML Parse Error: {e}")
        return {"error": "File BPMN tidak valid atau rusak.", "detail": str(e)}
    except Exception as e:
        print(f"Error parsing BPMN: {e}")
        return {"error": "Gagal memproses file BPMN.", "detail": str(e)}
    
# -----------------------------------------------------------------
# PARSER SPESIFIK (USE CASE DIAGRAM) - PERBAIKAN NAMESPACE
# -----------------------------------------------------------------
def parse_use_case_diagram(xml_content):
    parsed_json = {"artifact_type": "USE_CASE_DIAGRAM", "actors": [], "use_cases": [], "relationships": []}
    try:
        ns = {'uml': 'http://www.omg.org/spec/UML/20131001',
              'xmi': 'http://www.omg.org/spec/XMI/20131001'}
        if xml_content.startswith(b'\xef\xbb\xbf'):
            xml_content = xml_content[3:]
        root = ET.fromstring(xml_content)
        for actor in root.xpath('//packagedElement[@xmi:type="uml:Actor"]', namespaces=ns):
            parsed_json["actors"].append({"name": actor.get('name')})
        for uc in root.xpath('//packagedElement[@xmi:type="uml:UseCase"]', namespaces=ns):
            parsed_json["use_cases"].append({"name": uc.get('name')})
        return parsed_json
    except ET.ParseError as e:
        print(f"XML Parse Error: {e}")
        return {"error": "File XMI tidak valid atau rusak.", "detail": str(e)}
    except Exception as e:
        print(f"Error parsing Use Case Diagram: {e}")
        return {"error": "Gagal memproses Use Case Diagram.", "detail": str(e)}

# -----------------------------------------------------------------
# PARSER SPESIFIK (ACTIVITY DIAGRAM) - PERBAIKAN NAMESPACE
# -----------------------------------------------------------------
def parse_activity_diagram(xml_content):
    parsed_json = {"artifact_type": "UML_Activity_Diagram", "activities": []}
    try:
        ns = {'uml': 'http://www.omg.org/spec/UML/20131001',
              'xmi': 'http://www.omg.org/spec/XMI/20131001'}
        if xml_content.startswith(b'\xef\xbb\xbf'):
            xml_content = xml_content[3:]
        root = ET.fromstring(xml_content)
        for activity in root.xpath('//packagedElement[@xmi:type="uml:Activity"]', namespaces=ns):
            activity_data = {"id": activity.get(f'{{{ns["xmi"]}}}id'), "name": activity.get('name'), "nodes": [], "flows": []}
            node_tags = ['executableNode', 'decisionNode', 'forkNode', 'joinNode', 'initialNode', 'activityFinalNode', 'OpaqueAction']
            for tag in node_tags:
                for node in activity.xpath(f'./node[@xmi:type="uml:{tag}"]', namespaces=ns):
                    activity_data["nodes"].append({"id": node.get(f'{{{ns["xmi"]}}}id'), "name": node.get('name', ''), "type": node.get(f'{{{ns["xmi"]}}}type').split(':')[-1]})
            for flow in activity.xpath('./edge[@xmi:type="uml:ControlFlow"]', namespaces=ns):
                activity_data["flows"].append({"id": flow.get(f'{{{ns["xmi"]}}}id'), "source": flow.get('source'), "target": flow.get('target')})
            parsed_json["activities"].append(activity_data)
        return parsed_json
    except ET.ParseError as e:
        print(f"XML Parse Error: {e}")
        return {"error": "File XMI tidak valid atau rusak.", "detail": str(e)}
    except Exception as e:
        print(f"Error parsing Activity Diagram: {e}")
        return {"error": "Gagal memproses Activity Diagram.", "detail": str(e)}
    
# -----------------------------------------------------------------
# PARSER SPESIFIK (SEQUENCE DIAGRAM)
# -----------------------------------------------------------------
def parse_sequence_diagram(xml_content):
    parsed_json = {"artifact_type": "Sequence Diagram", "diagram_name": "", "lifelines": [], "interactions": []}
    try:
        ns = {'uml': 'http://www.omg.org/spec/UML/20131001', 'xmi': 'http://www.omg.org/spec/XMI/20131001'}
        if xml_content.startswith(b'\xef\xbb\xbf'):
            xml_content = xml_content[3:]
        root = ET.fromstring(xml_content)
        interaction = root.find('.//interaction', ns)
        if interaction is None:
            interaction = root.find('.//packagedElement[@xmi:type="uml:Interaction"]', ns)
        if interaction is None:
             return {"error": "Tidak dapat menemukan elemen <interaction> utama."}
        parsed_json["diagram_name"] = interaction.get('name', 'Sequence Diagram')
        for lifeline in interaction.xpath('./lifeline', namespaces=ns):
            parsed_json["lifelines"].append({"id": lifeline.get(f'{{{ns["xmi"]}}}id'), "name": lifeline.get('name')})
        for msg in interaction.xpath('./message', namespaces=ns):
            parsed_json["interactions"].append({"id": msg.get(f'{{{ns["xmi"]}}}id'), "name": msg.get('name'), "message_type": msg.get('messageSort', 'synchCall'), "from_lifeline_id": msg.get('sendEvent'), "to_lifeline_id": msg.get('receiveEvent')})
        return parsed_json
    except ET.ParseError as e:
        print(f"XML Parse Error: {e}")
        return {"error": "File XMI tidak valid atau rusak.", "detail": str(e)}
    except Exception as e:
        print(f"Error parsing Sequence Diagram: {e}")
        return {"error": "Gagal memproses Sequence Diagram.", "detail": str(e)}

# -----------------------------------------------------------------
# PARSER SPESIFIK (USE CASE SPECIFICATION)
# -----------------------------------------------------------------
def parse_use_case_spec(text_content):
    parsed_json = {"artifact_type": "Use Case Specification", "use_case_name": "", "summary_description": "", "actors": [], "preconditions": [], "postconditions": [], "flows": {"basic_path": [], "alternative_paths": []}, "business_rules": [], "non_functional_requirements": []}
    patterns = {
        'use_case_name': re.compile(r"Use Case Name:\s*(.*)", re.I),
        'summary_description': re.compile(r"Summary Description:\s*(.*)", re.I),
        'actors': re.compile(r"Actor\(s\):\s*\n(.*?)(?=\n\n|\n[A-Z_ ]+:)", re.I | re.S),
        'preconditions': re.compile(r"Pre-Condition:\s*\n(.*?)(?=\n\n|\n[A-Z_ ]+:)", re.I | re.S),
        'postconditions': re.compile(r"Post-Condition\(s\):\s*\n(.*?)(?=\n\n|\n[A-Z_ ]+:)", re.I | re.S),
        'business_rules': re.compile(r"Business Rules:\s*\n(.*?)(?=\n\n|\n[A-Z_ ]+:)", re.I | re.S),
        'non_functional_requirements': re.compile(r"Non-Functional Requirements:\s*\n(.*?)(?=\n\n|\n[A-Z_ ]+:)", re.I | re.S),
        'basic_path': re.compile(r"Basic Path:\s*\n(.*?)(?=\n\n|Alternative Paths:|Business Rules:)", re.I | re.S),
    }
    name_match = patterns['use_case_name'].search(text_content)
    if name_match:
        parsed_json["use_case_name"] = name_match.group(1).strip()
    desc_match = patterns['summary_description'].search(text_content)
    if desc_match:
        parsed_json["summary_description"] = desc_match.group(1).strip()
    def extract_list(match_obj):
        if not match_obj:
            return []
        items = match_obj.group(1).strip().split('\n')
        return [item.strip() for item in items if item.strip()]
    parsed_json["preconditions"] = extract_list(patterns['preconditions'].search(text_content))
    parsed_json["postconditions"] = extract_list(patterns['postconditions'].search(text_content))
    parsed_json["business_rules"] = extract_list(patterns['business_rules'].search(text_content))
    parsed_json["non_functional_requirements"] = extract_list(patterns['non_functional_requirements'].search(text_content))
    actors_match = patterns['actors'].search(text_content)
    if actors_match:
        actor_lines = actors_match.group(1).strip().split('\n')
        for line in actor_lines:
            line = line.strip().lstrip('- ')
            if ':' in line:
                parts = line.split(':', 1)
                parsed_json["actors"].append({"type": parts[0].strip().lower(), "name": parts[1].strip()})
    basic_path_match = patterns['basic_path'].search(text_content)
    if basic_path_match:
        steps = extract_list(basic_path_match)
        for i, step_text in enumerate(steps):
            step_text = re.sub(r"^\d+\.\s*", "", step_text)
            actor_action = step_text.split(':', 1)
            actor = "Unknown"
            action = step_text
            if len(actor_action) == 2:
                actor = actor_action[0].strip()
                action = actor_action[1].strip()
            parsed_json["flows"]["basic_path"].append({"step_number": i + 1, "actor": actor, "action": action})
    return parsed_json

# -----------------------------------------------------------------
# PARSER SPESIFIK (WIREFRAME / SALT) - PERBAIKAN LOGIKA FINAL
# -----------------------------------------------------------------
def parse_wireframe_salt(text_content):
    """
    Mem-parsing file teks PlantUML Salt (.salt, .puml, .txt).
    Mengekstrak komponen UI (Button, Input, Label, dll).
    Sesuai dengan Skema JSON Standar Anda (Appendix C.1.7).
    """
    parsed_json = {"artifact_type": "Wireframe", "screen_name": "Unknown Screen", "components": [], "layout_structure": {}}
    
    patterns = {
        'title': re.compile(r'{\s*"([^"]+)"', re.I),
        # Input regex: matches [   ], [...] (3+ titik), or [___] (3+ underscore)
        'input': re.compile(r'\[\s*(\.{3,}|_{3,}|\s*)\s*\]', re.I),
        # Button regex: matches [Anything Saja]
        'button': re.compile(r'\[\s*([^\]]+)\s*\]', re.I), 
        'label_input': re.compile(r'"([^"]+)"\s*\[', re.I),
    }
    
    title_match = patterns['title'].search(text_content)
    if title_match:
        parsed_json["screen_name"] = title_match.group(1).strip()
    
    # Perulangan utama: Cek baris per baris
    for i, line in enumerate(text_content.split('\n')):
        line = line.strip()
        
        # --- PERBAIKAN LOGIKA ---
        # CEK INPUT DULU (lebih spesifik)
        input_match = patterns['input'].search(line)
        if input_match:
            # Cek apakah isi di dalam kurung [...] adalah input (kosong, ..., atau ___)
            # group(1) akan berisi '...', '___', atau '   ' (spasi)
            is_input_content = input_match.group(1)
            
            # Jika isinya adalah spasi, titik, atau underscore, itu adalah INPUT
            if is_input_content.strip() == '' or is_input_content.startswith('.') or is_input_content.startswith('_'):
                component = {"id": f"input-{i}", "kind": "Input", "properties": {"text": "", "placeholder": ""}}
                label_match = patterns['label_input'].search(line)
                if label_match:
                    component["properties"]["text"] = label_match.group(1).strip()
                parsed_json["components"].append(component)
                continue # Penting: Lanjut ke baris berikutnya, JANGAN proses sebagai button

        # JIKA BUKAN INPUT, BARU CEK BUTTON (kurang spesifik)
        button_match = patterns['button'].search(line)
        if button_match:
             parsed_json["components"].append({
                "id": f"btn-{i}",
                "kind": "Button",
                "properties": {"text": button_match.group(1).strip()}
            })
        # --- PERBAIKAN LOGIKA SELESAI ---

    return parsed_json