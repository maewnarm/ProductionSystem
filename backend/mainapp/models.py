from django.db import models
from datetime import datetime

from django.db.models.aggregates import Max

# Create your models here.
class Regis(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    work_no=models.CharField(max_length=6,blank=True,null=True)
    work_name=models.CharField(max_length=50,blank=True,null=True)
    user1=models.CharField(max_length=200,blank=True,null=True)

class WSlist(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    work_no=models.CharField(max_length=15,blank=True,null=True)
    work_name=models.CharField(max_length=100,blank=True,null=True)
    ws_path=models.CharField(max_length=300,blank=True,null=True)
    section_code=models.CharField(max_length=10,blank=True,null=True)

class WSget(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    cur_work_no=models.CharField(max_length=15,blank=True,null=True)
    section_code=models.CharField(max_length=10,blank=True,null=True)

class OperationHistory(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    date_mem=models.DateField()
    time_mem=models.TimeField()
    type_mem=models.IntegerField()
    ng_code=models.CharField(max_length=10,blank=True,null=True)
    machine_no=models.CharField(max_length=200,blank=True,null=True)
    machine_name=models.CharField(max_length=200,blank=True,null=True)
    result_data=models.CharField(max_length=4000,blank=True,null=True)
    work_counter=models.PositiveIntegerField(blank=True,null=True)
    part_no=models.CharField(max_length=15,blank=True,null=True)

class StationList(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    machine_index=models.CharField(max_length=10,blank=True,null=True)
    machine_name=models.CharField(max_length=200,blank=True,null=True)
    machine_ht=models.DecimalField(max_digits=4,decimal_places=1,blank=True,null=True)
    machine_mt=models.DecimalField(max_digits=4,decimal_places=1,blank=True,null=True)

class ResultList(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    machine_index=models.CharField(max_length=10,blank=True,null=True)
    result_index=models.IntegerField()
    result_name=models.CharField(max_length=100,blank=True,null=True)
    result_type=models.CharField(max_length=20,blank=True,null=True)
    result_limit=models.CharField(max_length=50,blank=True,null=True)

class FaultList(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    machine_index=models.CharField(max_length=10,blank=True,null=True)
    ng_code=models.CharField(max_length=10,blank=True,null=True)
    detail_mem=models.CharField(max_length=150,blank=True,null=True)


#manual operation ratio
class ItemList(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    item_name=models.CharField(max_length=100,blank=True,null=True)
    unit_name=models.CharField(max_length=5,blank=True,null=True)
    item_index=models.IntegerField(blank=True,null=True)
    row_index=models.IntegerField(blank=True,null=True)
    editable_item=models.BooleanField(blank=True,null=True)
    line_name=models.CharField(max_length=30,blank=True,null=True)

class DataList(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    year_data=models.IntegerField(blank=True,null=True)
    month_data=models.IntegerField(blank=True,null=True)
    selected_data=models.BooleanField(blank=True,null=True)
    item_index=models.IntegerField(blank=True,null=True)
    data_item=models.CharField(max_length=500,blank=True,null=True)
    line_name=models.CharField(max_length=30,blank=True,null=True)
    shift_index=models.IntegerField(blank=True,null=True)

class LineList(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    line_name=models.CharField(max_length=30,blank=True,null=True)
    line_ct=models.DecimalField(max_digits=4,decimal_places=1,blank=True,null=True)
    line_limit=models.IntegerField(null=True,blank=True)

#Record Data system
class ControlItems(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    partno=models.CharField(max_length=20,blank=True,null=True)
    process=models.CharField(max_length=100,blank=True,null=True)
    itemid=models.CharField(max_length=5,blank=True,null=True)
    parameter=models.CharField(max_length=2000,blank=True,null=True)
    recmethod=models.CharField(max_length=15,blank=True,null=True)
    limit=models.CharField(max_length=40,blank=True,null=True)
    unit=models.CharField(max_length=10,blank=True,null=True)
    masterval=models.DecimalField(max_digits=12,decimal_places=5,blank=True,null=True)
    calmethod=models.CharField(max_length=15,blank=True,null=True)
    meastimes=models.IntegerField(blank=True,null=True)
    interval1=models.IntegerField(blank=True,null=True)
    interval2=models.CharField(max_length=50,blank=True,null=True)
    interval_n=models.IntegerField(blank=True,null=True)
    interval_wc=models.IntegerField(blank=True,null=True)
    meastool=models.CharField(max_length=30,blank=True,null=True)
    mcno=models.CharField(max_length=15,blank=True,null=True)
    readability=models.CharField(max_length=6,blank=True,null=True)
    remark=models.CharField(default="",max_length=2000,blank=True,null=True)

class Partno(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    partno=models.CharField(max_length=20,blank=True,null=True)
    partname=models.CharField(max_length=100,blank=True,null=True)
    model=models.CharField(max_length=10,blank=True,null=True)

class DataRecord(models.Model):
    section=models.CharField(max_length=10,blank=True,null=True)
    partno=models.CharField(max_length=20,blank=True,null=True)
    process=models.CharField(max_length=100,blank=True,null=True)
    itemid=models.CharField(default="",max_length=5,blank=True,null=True)
    ym=models.CharField(max_length=7,blank=True,null=True)
    shift=models.CharField(max_length=1,blank=True,null=True)
    d1=models.CharField(default="",max_length=4000,blank=True,null=True)
    d2=models.CharField(default="",max_length=4000,blank=True,null=True)
    d3=models.CharField(default="",max_length=4000,blank=True,null=True)
    d4=models.CharField(default="",max_length=4000,blank=True,null=True)
    msg1=models.CharField(default="",max_length=4000,blank=True,null=True)
    msg2=models.CharField(default="",max_length=4000,blank=True,null=True)
    msg3=models.CharField(default="",max_length=4000,blank=True,null=True)
    msg4=models.CharField(default="",max_length=4000,blank=True,null=True)
    progress=models.CharField(default="",max_length=4000,blank=True,null=True)
    ngdayflag=models.CharField(default="",max_length=70,blank=True,null=True)
    xbar=models.CharField(default=";;",max_length=32,blank=True,null=True)
    cl=models.CharField(default=";;",max_length=21,blank=True,null=True)
    force=models.BooleanField(default=False)
    fxbar=models.CharField(default=";;",max_length=32,blank=True,null=True)
    fcl=models.CharField(default=";;",max_length=21,blank=True,null=True)
    dm1=models.CharField(default="",max_length=4000,blank=True,null=True)
    dm2=models.CharField(default="",max_length=4000,blank=True,null=True)
    dm3=models.CharField(default="",max_length=4000,blank=True,null=True)
    dm4=models.CharField(default="",max_length=4000,blank=True,null=True)
    update=models.CharField(default="",max_length=1000,blank=True,null=True)
    
class EmployeeData(models.Model):
    empid=models.CharField(max_length=10,primary_key=True)
    pswd=models.CharField(max_length=20,blank=True,null=True)
    empname=models.CharField(default="",max_length=30,blank=True,null=True)
    position=models.CharField(default="",max_length=5,blank=True,null=True)
    
class DataApprove(models.Model):
    section=models.CharField(max_length=10,blank=True,null=False,primary_key=True)
    linename=models.CharField(default="",max_length=50,blank=True,null=True)
    lla=models.CharField(default="",max_length=30,blank=True,null=True)
    llb=models.CharField(default="",max_length=30,blank=True,null=True)
    tl=models.CharField(default="",max_length=30,blank=True,null=True)
    am=models.CharField(default="",max_length=30,blank=True,null=True)
    agm=models.CharField(default="",max_length=30,blank=True,null=True)
    
class ApproveQueue(models.Model):
    recordid=models.CharField(max_length=15,blank=True,null=True)
    recordtype=models.IntegerField(blank=True,null=True)
    creator=models.CharField(default="",max_length=7,blank=True,null=True)
    checker=models.CharField(default="",max_length=800,blank=True,null=True)
    approver=models.CharField(default="",max_length=800,blank=True,null=True)
    status=models.CharField(default="",max_length=200,blank=True,null=True)
    update=models.CharField(default="",max_length=2000,blank=True,null=True)
    comment_check=models.CharField(default="",max_length=4000,blank=True,null=True)
    comment_approve=models.CharField(default="",max_length=4000,blank=True,null=True)

#machine documents
class MachineDocument(models.Model):
    mcno=models.CharField(max_length=12,blank=True,null=True)
    doctype=models.CharField(max_length=20,blank=True,null=True)
    docpath=models.CharField(default="",max_length=4000,blank=True,null=True)
    docfile=models.CharField(default="",max_length=4000,blank=True,null=True)
    
#announcement
class announcement(models.Model):
    msg=models.CharField(max_length=4000,blank=True,null=True)