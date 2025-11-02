# api/serializers.py
from rest_framework import serializers
from .models import Artefak, Workspace

class ArtefakSerializer(serializers.ModelSerializer):
    # Kita buat 'workspace' write-only, jadi frontend hanya perlu mengirim 'workspace_id'
    workspace_id = serializers.PrimaryKeyRelatedField(
        queryset=Workspace.objects.all(), 
        source='workspace', 
        write_only=True
    )

    class Meta:
        model = Artefak
        # Tentukan field yang akan divalidasi dan disimpan
        fields = ['id', 'name', 'file', 'type', 'workspace_id', 'filejson']
        # 'filejson' akan read-only, karena diisi oleh parser
        read_only_fields = ['id', 'filejson']

    def validate_type(self, value):
        """
        Memvalidasi apakah tipe artefak yang dikirim frontend adalah salah satu
        [cite_start]dari 8 tipe yang didukung di SRS Anda [cite: 38-46, 403].
        """
        SUPPORTED_TYPES = [
            'USE_CASE_SPEC', 'BPMN', 'CLASS_DIAGRAM', 'USE_CASE_DIAGRAM',
            'ACTIVITY_DIAGRAM', 'SEQUENCE_DIAGRAM', 'WIREFRAME_SALT', 'SQL_DDL'
        ]
        if value not in SUPPORTED_TYPES:
            raise serializers.ValidationError(f"Tipe artefak '{value}' tidak didukung.")
        return value