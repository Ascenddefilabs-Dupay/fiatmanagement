from rest_framework import serializers
from .models import Project
from .models import FiatWallet,User

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'








class FiatWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = FiatWallet
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'