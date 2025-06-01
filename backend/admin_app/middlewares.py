"""
Created by - Ashish Dewangan on 23-06-2023
Reason - To have custom middleware that will trap the request and find the tenant schema from that request
"""

from tenant_schemas.middleware import BaseTenantMiddleware
from .models import *
import logging
from django.db import connection
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.http import Http404
from tenant_schemas.utils import get_tenant_model, remove_www_and_dev, get_public_schema_name
from django.db import utils

class MutitenantMiddleware(BaseTenantMiddleware):
    logger=logging.getLogger("custom_logger")
            
    def get_tenant(self, model, hostname, request):

        self.logger.info("path -----"+ request.path)
        self.logger.info("hostname -----"+ hostname)

        path = request.path
        
        # if "public" in path:
        #     self.logger.info("Matched '/public/' in path. Routing to public schema.")
        #     from tenant_schemas.utils import get_public_schema_name
        #     return Tenant.objects.get(schema_name=get_public_schema_name())

        if "media" in path:
            from tenant_schemas.utils import get_public_schema_name
            return Tenant.objects.get(schema_name=get_public_schema_name())

        if "favicon" in path:
            from tenant_schemas.utils import get_public_schema_name
            return Tenant.objects.get(schema_name=get_public_schema_name())


        # if "site" in path:
        #     schemaName = "public"
        #     return Tenant.objects.get(schema_name=schemaName)
        # else:
        #     if "admin" in path:
        #         from django.conf import settings
        #         seperated = hostname.split(".")
        #         schemaName = settings.PUBLIC_SCHEMA_NAME
        #         if seperated[0] != settings.DOMAIN_NAME:
        #             schemaName = seperated[0]
        #         self.logger.info("admin side schema name-----"+ schemaName)    
        #         return Tenant.objects.get(schema_name=schemaName)
        #     else:
        #         import re
        #         from django.conf import settings
        #         self.logger.info(
        #             "extracted path-----"+path[(re.search("v1", path).end() + 1): len(path)]
        #         )
        #         splitedPath = path[(
        #             re.search("v1", path).end() + 1): len(path)]
        #         splitedWords = splitedPath.split("/")
        #         self.logger.info("splited words-----"+ str(splitedWords))
        #         self.logger.info("extracted schema name-----"+ splitedWords[0])
        #         schemaName = settings.PUBLIC_SCHEMA_NAME
        #         if splitedWords[0] != settings.DOMAIN_NAME:
        #             schemaName = splitedWords[0]
        #         return Tenant.objects.get(schema_name=schemaName)


        if "filter_room_city" in path or "site" in path:
            schemaName = "public"
            self.logger.info("Matched '/public/' or 'site' in path. Routing to public schema.")
            return Tenant.objects.get(schema_name=schemaName)
        else:
            if "/api/v1/" in path:
                import re
                from django.conf import settings
                self.logger.info("extracted path-----"+  path[(re.search("v1", path).end() + 1): len(path)])
                splitedPath = path[(
                    re.search("v1", path).end() + 1): len(path)]
                splitedWords = splitedPath.split("/")
                self.logger.info("splited words-----"+str(splitedWords))
                self.logger.info("extracted schema name-----"+splitedWords[0])
                schemaName = settings.PUBLIC_SCHEMA_NAME
                if splitedWords[0] != settings.DOMAIN_NAME:
                    schemaName = splitedWords[0]
                return Tenant.objects.get(schema_name=schemaName)
            else:
                from django.conf import settings
                seperated = hostname.split(".")
                schemaName = settings.PUBLIC_SCHEMA_NAME
                if seperated[0] != settings.DOMAIN_NAME:
                    schemaName=seperated[0]
                self.logger.info("admin side schema name-----"+schemaName)
                return Tenant.objects.get(schema_name=schemaName)
