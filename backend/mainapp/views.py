from django.shortcuts import render,redirect
from django.template.response import TemplateResponse
from .models import Regis
from django.contrib.auth.models import User,auth
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
# Create your views here.