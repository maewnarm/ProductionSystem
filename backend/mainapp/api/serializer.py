from django.contrib.auth.models import User
from rest_framework import serializers
from mainapp.models import Regis,WSlist,WSget,OperationHistory,StationList,ResultList,FaultList,ItemList,DataList,LineList,ControlItems,Partno,DataRecord,MachineDocument,DataApprove,EmployeeData,ApproveQueue,announcement


class RegisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Regis
        fields = ('__all__')

class WSlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = WSlist
        fields = ('__all__')

class WSGetSerializer(serializers.ModelSerializer):
    class Meta:
        model = WSget
        fields = ['cur_work_no']

class OperationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperationHistory
        fields = ('__all__')

class StationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = StationList
        fields = ('__all__')

class ResultListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultList
        fields = ('__all__')

class FaultListSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaultList
        fields = ('__all__')

class ItemListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemList
        fields = ('__all__')

class DataListSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataList
        fields = ('__all__')

class LineListSerializer(serializers.ModelSerializer):
    class Meta:
        model = LineList
        fields = ('__all__')

class ControlItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ControlItems
        fields = ('__all__')

class PartnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partno
        fields = ('__all__')

class DatarecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataRecord
        fields = ('__all__')

class DatarecordDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataRecord
        fields = ('id','itemid','shift','d1','d2','d3','d4','msg1','msg2','msg3','msg4','progress','ngdayflag','dm1','dm2','dm3','dm4','update')

class DatarecordXRSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataRecord
        fields = ('id','itemid','ym','shift','cl','fcl','force','xbar','fxbar')

class MachineDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MachineDocument
        fields = ('__all__')
        
class DataApproveSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataApprove
        fields = ('__all__')
        
class EmployeeDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeData
        fields = ('__all__')
        
class ApproveQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApproveQueue
        fields = ('__all__')
        
class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = announcement
        fields = ('__all__')