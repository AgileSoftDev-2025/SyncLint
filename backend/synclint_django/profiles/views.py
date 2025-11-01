from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Profile
from .serializers import ProfileSerializer

class ProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile