from django.contrib import admin
from .models import User, Workspace, Artefak, Report

admin.site.register(User)
admin.site.register(Workspace)
admin.site.register(Artefak)
admin.site.register(Report)

