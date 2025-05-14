
from django import template
from tenant_app.models import *
from tenant_app.serializers import *
import datetime
from django.utils.timezone import timedelta
from django.db.models.functions import TruncMonth
from django.db.models import Sum
from backend.config import * 

register = template.Library()


@register.simple_tag(takes_context=True)
def getProfileLink(context):
    from django.conf import settings
    request=context['request']
    data = dict()
    host=request.headers['Host'].split(":")
    if settings.DOMAIN_NAME != host[0].split(".")[0] :
        path= settings.HTTP_METHOD+request.headers['Host']+'/admin/tenant_app/setting/'
    else :
        path= settings.HTTP_METHOD+request.headers['Host']+'/admin/admin_app/appsetting/'
    data["setting"] = path
    return data


@register.filter
def divide(value, arg):
    try:
        return float(value) / float(arg)
    except (ValueError, ZeroDivisionError):
        return None

   
@register.filter
def multiply(qty, unit_price, *args, **kwargs):
    return qty * unit_price


@register.filter(name='split')
def split(value, key):
    return value.split(key)
