from typing import final
from rest_framework.generics import GenericAPIView,ListAPIView,RetrieveAPIView,CreateAPIView,UpdateAPIView,DestroyAPIView
from mainapp.models import Regis,WSlist,WSget,OperationHistory,StationList,ResultList,FaultList,ItemList,DataList,LineList,ControlItems,Partno,DataRecord,MachineDocument,DataApprove,EmployeeData,ApproveQueue,announcement
from .serializer import RegisSerializer,WSlistSerializer,WSGetSerializer,OperationSerializer,StationListSerializer,ResultListSerializer,FaultListSerializer,ItemListSerializer,DataListSerializer,LineListSerializer,ControlItemsSerializer,PartnoSerializer,DatarecordSerializer,DatarecordDataSerializer,DatarecordXRSerializer,MachineDocumentSerializer,DataApproveSerializer,EmployeeDataSerializer,ApproveQueueSerializer,AnnouncementSerializer
from drf_multiple_model.views import ObjectMultipleModelAPIView
from django.db import connection
from django.db.models import Q,Max
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework.mixins import UpdateModelMixin
from django.contrib.auth.forms import UserCreationForm
from rest_framework import serializers, status,viewsets

class RegisListView(ListAPIView):
    queryset = Regis.objects.all()
    serializer_class = RegisSerializer

class RegisDetailView(RetrieveAPIView):
    queryset = Regis.objects.all()
    serializer_class = RegisSerializer

class WSListView(ListAPIView):
    serializer_class = WSlistSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val
        qs = WSlist.objects.all().filter(section=sect)
        return qs

class WSDetailView(RetrieveAPIView):
    queryset = WSlist.objects.all()
    serializer_class = WSlistSerializer

class WSCreateView(CreateAPIView):
    queryset = WSlist.objects.all()
    serializer_class = WSlistSerializer

class WSUpdateView(UpdateAPIView):
    queryset = WSlist.objects.all()
    serializer_class = WSlistSerializer

class WSDeleteView(DestroyAPIView):
    queryset = WSlist.objects.all()
    serializer_class = WSlistSerializer

class WSGetView(ListAPIView):
    serializer_class = WSGetSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val
        qs = WSget.objects.all().filter(section=sect)
        return qs

class WorkCountView(APIView):
    serializer_class = OperationSerializer
    def get(self,request,*args,**kwargs):
        qs = OperationHistory.objects.all()
        query1 = self.request.GET.get("q")
        if query1:
            typ = query1.split('_')[0]
            if typ == "allday":
                qs1 = qs.filter(
                    (
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[2]) &
                        Q(time_mem__gte=query1.split('_')[4]) &
                        Q(part_no=query1.split('_')[5]) &
                        Q(section=query1.split('_')[6]) |
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[3]) &
                        Q(time_mem__lt=query1.split('_')[4]) &
                        Q(part_no=query1.split('_')[5]) &
                        Q(section=query1.split('_')[6])
                    )
                ).order_by('id').aggregate(Max('work_counter'))
            elif typ == "allnight":
                qs1 = qs.filter(
                    (
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[2]) &
                        Q(time_mem__gte=query1.split('_')[4]) &
                        Q(part_no=query1.split('_')[5]) &
                        Q(section=query1.split('_')[6]) |
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[3]) &
                        Q(time_mem__lt=query1.split('_')[4]) &
                        Q(part_no=query1.split('_')[5]) &
                        Q(section=query1.split('_')[6])
                    )
                ).order_by('id').aggregate(Max('work_counter'))
            elif typ == "day":
                qs1 = qs.filter(
                    (
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[2]) &
                        Q(time_mem__gte=query1.split('_')[3]) &
                        Q(time_mem__lt=query1.split('_')[4]) &
                        Q(part_no=query1.split('_')[5]) &
                        Q(section=query1.split('_')[6])
                    )
                ).order_by('id').aggregate(Max('work_counter'))
            elif typ == "night":
                qs1 = qs.filter(
                    (
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[2]) &
                        Q(time_mem__gte=query1.split('_')[4]) &
                        Q(part_no=query1.split('_')[6]) &
                        Q(section=query1.split('_')[7]) |
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[3]) &
                        Q(time_mem__lt=query1.split('_')[5]) &
                        Q(part_no=query1.split('_')[6]) &
                        Q(section=query1.split('_')[7])
                    )
                ).order_by('id').aggregate(Max('work_counter'))
        return Response(qs1)

class WorkDistinctView(APIView):
    serializer_class = OperationSerializer
    def get(self,request,*args,**kwargs):
        qs = OperationHistory.objects.values_list('part_no').distinct()
        query1 = self.request.GET.get("q")
        if query1:
            typ = query1.split('_')[0]
            if typ == "allday":
                qs1 = qs.filter(
                    (
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[2]) &
                        Q(time_mem__gte=query1.split('_')[4]) &
                        Q(section=query1.split('_')[5]) |
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[3]) &
                        Q(time_mem__lt=query1.split('_')[4]) &
                        Q(section=query1.split('_')[5])
                    )
                ).filter(part_no__isnull=False)
            elif typ == "allnight":
                qs1 = qs.filter(
                    (
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[2]) &
                        Q(time_mem__gte=query1.split('_')[4]) &
                        Q(section=query1.split('_')[5]) |
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[3]) &
                        Q(time_mem__lt=query1.split('_')[4]) &
                        Q(section=query1.split('_')[5])
                    )
                ).filter(part_no__isnull=False)
            elif typ == "day":
                qs1 = qs.filter(
                    (
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[2]) &
                        Q(time_mem__gte=query1.split('_')[3]) &
                        Q(time_mem__lt=query1.split('_')[4]) &
                        Q(section=query1.split('_')[5])
                    )
                ).filter(part_no__isnull=False)
            elif typ == "night":
                qs1 = qs.filter(
                    (
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[2]) &
                        Q(time_mem__gte=query1.split('_')[4]) &
                        Q(section=query1.split('_')[6]) |
                        Q(machine_no=query1.split('_')[1]) &
                        Q(date_mem=query1.split('_')[3]) &
                        Q(time_mem__lt=query1.split('_')[5]) &
                        Q(section=query1.split('_')[6])
                    )
                ).filter(part_no__isnull=False).order_by('part_no')
        return Response(qs1)    

class OperationView(ListAPIView):
    queryset = OperationHistory.objects.all().order_by('id')
    serializer_class = OperationSerializer

class OperationDetailViewDay(ListAPIView):
    serializer_class = OperationSerializer
    '''filter_fields = {
        'date_mem': ['icontains'],
        'time_mem': ['gte','lte']
    }'''
    def get_queryset(self):
        qs = OperationHistory.objects.all()
        query1 = self.request.GET.get("q1")
        if query1:
            qs1 = qs.filter(
                (
                    Q(machine_no=query1.split('_')[3]) &
                    Q(date_mem=query1.split('_')[0]) &
                    Q(time_mem__gte=query1.split('_')[1]) &
                    Q(time_mem__lt=query1.split('_')[2]) &
                    Q(section=query1.split('_')[4])
                )
            ).order_by('id')
        return qs1

class OperationDetailViewNight(ListAPIView):
    serializer_class = OperationSerializer
    def get_queryset(self):
        qs = OperationHistory.objects.all()
        query1 = self.request.GET.get("q1")
        if query1:
            qs1 = qs.filter(
                (
                    Q(machine_no=query1.split('_')[6]) &
                    Q(date_mem=query1.split('_')[0]) &
                    Q(time_mem__gte=query1.split('_')[1]) &
                    Q(time_mem__lt=query1.split('_')[2]) &
                    Q(time_mem__lt=query1.split('_')[7]) |
                    Q(machine_no=query1.split('_')[6]) &
                    Q(date_mem=query1.split('_')[3]) &
                    Q(time_mem__gte=query1.split('_')[4]) &
                    Q(time_mem__lt=query1.split('_')[5]) &
                    Q(time_mem__lt=query1.split('_')[7])
                )
            ).order_by('id')
        return qs1

class OperationDetailViewFaultDay(ListAPIView):
    serializer_class = OperationSerializer
    '''filter_fields = {
        'date_mem': ['icontains'],
        'time_mem': ['gte','lte']
    }'''
    def get_queryset(self):
        qs = OperationHistory.objects.all()
        query1 = self.request.GET.get("q1")
        if query1:
            qs1 = qs.filter(
                (
                    Q(date_mem=query1.split('_')[0]) &
                    Q(time_mem__gte=query1.split('_')[1]) &
                    Q(time_mem__lt=query1.split('_')[2]) &
                    ~Q(type_mem=5)
                )
            ).order_by('machine_no','id')
        return qs1

class OperationDetailViewFaultNight(ListAPIView):
    serializer_class = OperationSerializer
    def get_queryset(self):
        qs = OperationHistory.objects.all()
        query1 = self.request.GET.get("q1")
        if query1:
            qs1 = qs.filter(
                (
                    Q(date_mem=query1.split('_')[0]) &
                    Q(time_mem__gte=query1.split('_')[1]) &
                    Q(time_mem__lt=query1.split('_')[2]) &
                    ~Q(type_mem=5) |
                    Q(date_mem=query1.split('_')[3]) &
                    Q(time_mem__gte=query1.split('_')[4]) &
                    Q(time_mem__lt=query1.split('_')[5]) &
                    ~Q(type_mem=5)
                )
            ).order_by('id')
        return qs1

class StationListView(ListAPIView):
    serializer_class = StationListSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val
        return StationList.objects.all().filter(section=sect).order_by('machine_index')

class StationDetailView(ListAPIView):
    serializer_class = StationListSerializer
    def get_queryset(self):
        stationindex = self.kwargs['st_ind']
        return StationList.objects.filter(machine_index=stationindex)

class StationCreateView(CreateAPIView):
    queryset = StationList.objects.all()
    serializer_class = StationListSerializer

class StationUpdateView(UpdateAPIView):
    queryset = StationList.objects.all()
    serializer_class = StationListSerializer

class StationDeleteView(DestroyAPIView):
    queryset = StationList.objects.all()
    serializer_class = StationListSerializer

class ResultListView(ListAPIView):
    queryset = ResultList.objects.all().order_by('machine_index').order_by('result_index')
    serializer_class = ResultListSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val
        qs = ResultList.objects.all().filter(section=sect).order_by('machine_index').order_by('result_index')
        return qs

class ResultDetailView(ListAPIView):
    serializer_class = ResultListSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        st = val.split("_")[1]
        return ResultList.objects.filter(section=sect,machine_index=st).order_by('result_index')

class ResultListCreateView(CreateAPIView):
    queryset = ResultList.objects.all()
    serializer_class = ResultListSerializer

class ResultListUpdateView(UpdateAPIView):
    queryset = ResultList.objects.all()
    serializer_class = ResultListSerializer

class ResultListDeleteView(DestroyAPIView):
    queryset = ResultList.objects.all()
    serializer_class = ResultListSerializer

class FaultListView(ListAPIView):
    serializer_class = FaultListSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val
        qs = FaultList.objects.all().filter(section=sect).order_by('machine_index').order_by('ng_code')
        return qs

class FaultDetailView(ListAPIView):
    serializer_class = FaultListSerializer
    def get_queryset(self):
        val = self.kwargs['st_ind']
        sect = val.split("_")[0]
        stationindex = val.split("_")[1]
        return FaultList.objects.filter(section=sect,machine_index=stationindex).order_by('ng_code')

class FaultListCreateView(CreateAPIView):
    queryset = FaultList.objects.all()
    serializer_class = FaultListSerializer

class FaultListUpdateView(UpdateAPIView):
    queryset = FaultList.objects.all()
    serializer_class = FaultListSerializer

class FaultListDeleteView(DestroyAPIView):
    queryset = FaultList.objects.all()
    serializer_class = FaultListSerializer


#Manual Operation Ratio
class ItemListView(ListAPIView):
    queryset = ItemList.objects.all().order_by('row_index')
    serializer_class = ItemListSerializer

#class ItemDetailView(RetrieveAPIView):
    #queryset = ItemList.objects.all()
    #serializer_class = ItemListSerializer

class ItemDetailView(ListAPIView):
    serializer_class = ItemListSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect= val.split("_")[0]
        linename= val.split("_")[1]
        return ItemList.objects.filter(section=sect,line_name=linename).order_by('row_index')

class ItemListCreateView(CreateAPIView):
    queryset = ItemList.objects.all()
    serializer_class = ItemListSerializer

class ItemListUpdateView(UpdateAPIView):
    queryset = ItemList.objects.all()
    serializer_class = ItemListSerializer

class ItemListDeleteView(DestroyAPIView):
    queryset = ItemList.objects.all()
    serializer_class = ItemListSerializer

class ItemUpdateView(UpdateAPIView):
    def put(self,request,*args,**kwargs):
        vari = self.kwargs['src']
        sect = vari.split("_")[0]
        oldname = vari.split("_")[1]
        newname = vari.split("_")[2]
        try:
            ItemList.objects.filter(section=sect,line_name=oldname).update(line_name=newname)
            instances =  ItemList.objects.all()
            serializer = ItemListSerializer(instance=instances,many=True)
            return Response(serializer.data)
        except Exception as e:
            print("error item update,",e)
            raise APIException

class DataListView(ListAPIView):
    queryset = DataList.objects.all().order_by('year_data').order_by('month_data')
    serializer_class = DataListSerializer

class DataDetailView(ListAPIView):
    serializer_class = DataListSerializer
    def get_queryset(self):
        monthindex = self.kwargs['LYM_ind']
        sect=monthindex.split("_")[0]
        line=monthindex.split("_")[1]
        year=monthindex.split("_")[2]
        month=monthindex.split("_")[3]
        shift=monthindex.split("_")[4]
        return DataList.objects.filter(section=sect,year_data=year,month_data=month,line_name=line,shift_index=shift).order_by('item_index')

class DataDetailItemView(ListAPIView):
    serializer_class = DataListSerializer
    def get_queryset(self):
        monthindex = self.kwargs['LYMid_ind']
        sect=monthindex.split("_")[0]
        line=monthindex.split("_")[1]
        year=monthindex.split("_")[2]
        month=monthindex.split("_")[3]
        itemind=monthindex.split("_")[4]
        shift=monthindex.split("_")[5]
        return DataList.objects.filter(section=sect,year_data=year,month_data=month,item_index=itemind,line_name=line,shift_index=shift)

class DataListCreateView(CreateAPIView):
    queryset = DataList.objects.all()
    serializer_class = DataListSerializer

class DataListUpdateView(UpdateAPIView):
    queryset = DataList.objects.all()
    serializer_class = DataListSerializer

class DataListDeleteView(DestroyAPIView):
    queryset = DataList.objects.all()
    serializer_class = DataListSerializer

class DataUpdateView(APIView):
    def put(self,request,*args,**kwargs):
        vari = self.kwargs['src']
        sect = vari.split("_")[0]
        oldname = vari.split("_")[1]
        newname = vari.split("_")[2]
        try:
            DataList.objects.filter(section=sect,line_name=oldname).update(line_name=newname)
            instances =  DataList.objects.all()
            serializer = DataListSerializer(instance=instances,many=True)
            return Response(serializer.data)
        except Exception as e:
            print("error data update,",e)
            raise APIException

class DataUpdateSelectView(APIView):
    def put(self,request,*args,**kwargs):
        vari = self.kwargs['src']
        sect = vari.split("_")[0]
        year = vari.split("_")[1]
        month = vari.split("_")[2]
        itemindex = vari.split("_")[3]
        linename = vari.split("_")[4]
        shift = vari.split("_")[5]
        select = vari.split("_")[6]
        try:
            DataList.objects.filter(section=sect,year_data=year,month_data=month,item_index=itemindex,line_name=linename,shift_index=shift).update(selected_data=select)
            instances =  DataList.objects.all()
            serializer = DataListSerializer(instance=instances,many=True)
            return Response(serializer.data)
        except Exception as e:
            print("error data update,",e)
            raise APIException

class LineListView(ListAPIView):
    serializer_class = LineListSerializer
    def get_queryset(self):
        sect = self.kwargs['val']
        qs = LineList.objects.all().filter(section=sect).order_by('line_name')
        return qs

class LineListCreateView(CreateAPIView):
    queryset = LineList.objects.all()
    serializer_class = LineListSerializer

class LineListUpdateView(UpdateAPIView):
    queryset = LineList.objects.all()
    serializer_class = LineListSerializer

class LineListDeleteView(DestroyAPIView):
    queryset = LineList.objects.all()
    serializer_class = LineListSerializer

#Record Data system
class PartnoListView(ListAPIView):
    serializer_class = PartnoSerializer
    def get_queryset(self):
        sect = self.kwargs['val']
        qs = Partno.objects.all().filter(section=sect)
        return qs

class PartnoListCreateView(CreateAPIView):
    queryset = Partno.objects.all()
    serializer_class = PartnoSerializer

class PartnoListUpdateView(UpdateAPIView):
    queryset = Partno.objects.all()
    serializer_class = PartnoSerializer

class PartnoListDeleteView(DestroyAPIView):
    queryset = Partno.objects.all()
    serializer_class = PartnoSerializer

class ControlitemsListView(ListAPIView):
    serializer_class = ControlItemsSerializer
    def get_queryset(self):
        val =self.kwargs['val']
        sect = val
        qs = ControlItems.objects.all().filter(section=sect).order_by('process')
        return qs
    
class ControlItemsSectionDistinctView(APIView):
    serializer_class = ControlItemsSerializer
    def get(self,request,*args,**kwargs):
        qs = ControlItems.objects.all().values('section').distinct()
        return Response(qs)

class ControlitemsProcessListView(APIView):
    serializer_class = ControlItemsSerializer
    def get(self,request,*args,**kwargs):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        qs = ControlItems.objects.all().filter(section=sect,partno=pno).values('process').distinct()
        return Response(qs)

class ControlitemsPartnoListView(ListAPIView):
    serializer_class = ControlItemsSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        proc = val.split("_")[2]
        qs = ControlItems.objects.all().filter(
            Q(section=sect) &
            Q(partno=pno) &
            Q(process=proc) &
            Q(itemid__gt=0)
            ).order_by('itemid')
        return qs

class ControlitemsListCreateView(CreateAPIView):
    queryset = ControlItems.objects.all()
    serializer_class = ControlItemsSerializer

class ControlitemsListUpdateView(UpdateAPIView):
    queryset = ControlItems.objects.all()
    serializer_class = ControlItemsSerializer

class ControlitemsListDeleteView(DestroyAPIView):
    queryset = ControlItems.objects.all()
    serializer_class = ControlItemsSerializer

class ControlitemsUpdateNo(APIView):
    def put(self,request,*args,**kwargs):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        oldno = val.split("_")[1]
        newno = val.split("_")[2]
        try:
            ControlItems.objects.filter(section=sect,partno=oldno).update(partno=newno)
            instances =  ControlItems.objects.all()
            serializer = ControlItemsSerializer(instance=instances,many=True)
            return Response(serializer.data)
        except Exception as e:
            print("error control item update,",e)
            raise APIException

class ControlitemsUpdateProcess(APIView):
    def put(self,request,*args,**kwargs):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        oldproc = val.split("_")[2]
        newproc = val.split("_")[3]
        try:
            ControlItems.objects.filter(section=sect,partno=pno,process=oldproc).update(process=newproc)
            instances =  ControlItems.objects.all()
            serializer = ControlItemsSerializer(instance=instances,many=True)
            return Response(serializer.data)
        except Exception as e:
            print("error control item update,",e)
            raise APIException

class ControlitemsDeleteProcess(APIView):
    serializer = ControlItemsSerializer
    def delete(self,request,*args,**kwargs):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        proc = val.split("_")[2]
        qs = ControlItems.objects.all().filter(section=sect,partno=pno,process=proc).delete()
        return Response(qs)

class DataRecordListView(ListAPIView):
    serializer_class = DatarecordSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        proc = val.split("_")[2]
        item = val.split("_")[3]
        y = val.split("_")[4]
        shift = val.split("_")[5]
        qs = DataRecord.objects.all().filter(
            section=sect,
            partno=pno,
            process=proc,
            itemid=item,
            ym=y,
            shift=shift,
        )
        return qs

class DataRecordDataView(ListAPIView):
    serializer_class = DatarecordDataSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        proc = val.split("_")[2]
        y = val.split("_")[3]
        shift = val.split("_")[4]
        if shift == "no":
            qs = DataRecord.objects.all().filter(
                section=sect,
                partno=pno,
                process=proc,
                ym=y
            )
        else:
            qs = DataRecord.objects.all().filter(
                section=sect,
                partno=pno,
                process=proc,
                ym=y,
                shift=shift
            )
        return qs
    
class DataRecordDataApproveView(ListAPIView):
    serializer_class = DatarecordSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        recordid = val.split("_")[0]
        shift = val.split("_")[1]
        if shift == "no":
            qs = DataRecord.objects.all().filter(
                id=recordid
            )
        else:
            qs = DataRecord.objects.all().filter(
                id=recordid,
                shift=shift
            )
        return qs

class DataRecordXRView(ListAPIView):
    serializer_class = DatarecordXRSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        proc = val.split("_")[2]
        item = val.split("_")[3]
        qs = DataRecord.objects.all().filter(
            section=sect,
            partno=pno,
            process=proc,
            itemid=item
        )
        return qs

class DataRecordXRonlyView(ListAPIView):
    serializer_class = DatarecordXRSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        proc = val.split("_")[2]
        y = val.split("_")[3]
        shift = val.split("_")[4]
        qs = DataRecord.objects.all().filter(
            section=sect,
            partno=pno,
            process=proc,
            ym=y,
            shift=shift
        ).exclude(cl="",itemid='apprv')
        return qs

class DataRecordAmountView(ListAPIView):
    serializer_class = DatarecordSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        proc = val.split("_")[2]
        y = val.split("_")[3]
        qs = DataRecord.objects.all().filter(
            Q(section=sect) &
            Q(partno=pno) &
            Q(process=proc) &
            Q(ym=y) 
        )
        return qs

class DataRecordCreateView(CreateAPIView):
    queryset = DataRecord.objects.all()
    serializer_class = DatarecordSerializer

class DataRecordCreateMultiView(viewsets.ModelViewSet):
    queryset = DataRecord.objects.all()
    serializer_class = DatarecordSerializer
    def post(self,request,*args,**kwargs):
        data = request.data.get("items") if 'items' in request.data else request.data
        many = isinstance(data,list)
        print(data,many)
        serializer = self.get_serializer(data=data,many=many)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data,status=status.HTTP_201_CREATED,headers=headers)

class DataRecordUpdateView(GenericAPIView,UpdateModelMixin):
    queryset = DataRecord.objects.all()
    serializer_class = DatarecordSerializer
    def put(self,request,*args,**kwargs):
        return self.partial_update(request,*args,**kwargs)

class DataRecordDeleteView(DestroyAPIView):
    queryset = DataRecord.objects.all()
    serializer_class = DatarecordSerializer

class DataRecordUpdateNo(APIView):
    def put(self,request,*args,**kwargs):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        oldno = val.split("_")[1]
        newno = val.split("_")[2]
        try:
            DataRecord.objects.filter(section=sect,partno=oldno).update(partno=newno)
            instances =  DataRecord.objects.all()
            serializer = DatarecordSerializer(instance=instances,many=True)
            return Response(serializer.data)
        except Exception as e:
            print("error data record update,",e)
            raise APIException

class DataRecordUpdateProcess(APIView):
    def put(self,request,*args,**kwargs):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        oldproc = val.split("_")[2]
        newproc = val.split("_")[3]
        try:
            DataRecord.objects.filter(section=sect,partno=pno,process=oldproc).update(process=newproc)
            instances =  DataRecord.objects.all()
            serializer = DatarecordSerializer(instance=instances,many=True)
            return Response(serializer.data)
        except Exception as e:
            print("error control item update,",e)
            raise APIException

class DataRecordUpdateItem(APIView):
    def put(self,request,*args,**kwargs):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        proc = val.split("_")[2]
        olditem = val.split("_")[3]
        newitem = val.split("_")[4]
        try:
            DataRecord.objects.filter(section=sect,partno=pno,process=proc,itemid=olditem).update(itemid=newitem)
            instances =  DataRecord.objects.all()
            serializer = DatarecordSerializer(instance=instances,many=True)
            return Response(serializer.data)
        except Exception as e:
            print("error control item update,",e)
            raise APIException

class DataRecordDeletePartno(APIView):
    serializer = DatarecordSerializer
    def delete(self,request,*args,**kwargs):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        qs = DataRecord.objects.all().filter(section=sect,partno=pno).delete()
        return Response(qs)

class DataRecordDeleteProcess(APIView):
    serializer = DatarecordSerializer
    def delete(self,request,*args,**kwargs):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        proc = val.split("_")[2]
        qs = DataRecord.objects.all().filter(section=sect,partno=pno,process=proc).delete()
        return Response(qs)

class DataRecordDeleteItem(APIView):
    serializer_class = DatarecordSerializer
    def delete(self,request,*args,**kwargs):
        val = self.kwargs['val']
        sect = val.split("_")[0]
        pno = val.split("_")[1]
        proc = val.split("_")[2]
        item = val.split("_")[3]
        qs = DataRecord.objects.all().filter(section=sect,partno=pno,process=proc,itemid=item).delete()
        return Response(qs)
    
class EmployeeDataListView(ListAPIView):
    queryset = EmployeeData.objects.all()
    serializer_class = EmployeeDataSerializer 

class EmployeeDataEmpView(ListAPIView):
    serializer_class = EmployeeDataSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        empid = val.split("_")[0]
        qs = EmployeeData.objects.all().filter(empid=empid)
        return qs
    
class DataApproveListView(ListAPIView):
    queryset = DataApprove.objects.all()
    serializer_class = DataApproveSerializer
    
class DataApproveSectionView(ListAPIView):
    serializer_class = DataApproveSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        sect = val
        qs = DataApprove.objects.all().filter(section=sect)
        return qs
    
class ApproveQueueListView(ListAPIView):
    queryset = ApproveQueue.objects.all()
    serializer_class = ApproveQueueSerializer
    
class ApproveQueueEmpListView(ListAPIView):
    serializer_class = ApproveQueueSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        typ = val.split("_")[0]
        val1 = val.split("_")[1]
        if typ == "empidcontains":
            qs = ApproveQueue.objects.all().filter(
                Q(creator__contains=val1) |
                Q(checker__contains=val1) |
                Q(approver__contains=val1)
            )
        elif typ == "recordid":
            qs= ApproveQueue.objects.all().filter(recordid=val1)
        return qs
    
class ApproveQueueCreateView(CreateAPIView):
    queryset = ApproveQueue.objects.all()
    serializer_class = ApproveQueueSerializer

class ApproveQueueUpdateView(GenericAPIView,UpdateModelMixin):
    queryset = ApproveQueue.objects.all()
    serializer_class = ApproveQueueSerializer
    def put(self,request,*args,**kwargs):
        return self.partial_update(request,*args,**kwargs)

class ApproveQueueDeleteView(DestroyAPIView):
    queryset = ApproveQueue.objects.all()
    serializer_class = ApproveQueueSerializer

#machine documents
class MachineDocumentListView(ListAPIView):
    serializer_class = MachineDocumentSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        mcno = val
        qs = MachineDocument.objects.all().filter(mcno=mcno).exclude(doctype="none")
        return qs

class MachineDocumentDistinctView(ListAPIView):
    serializer_class = MachineDocumentSerializer
    def get_queryset(self):
        #qs = MachineDocument.objects.all().values('mcno').distinct()
        qs = MachineDocument.objects.all().filter(doctype="none")
        return qs

class MachineDocumentCreateView(CreateAPIView):
    queryset = MachineDocument.objects.all()
    serializer_class = MachineDocumentSerializer

class MachineDocumentUpdateView(UpdateAPIView):
    queryset = MachineDocument.objects.all()
    serializer_class = MachineDocumentSerializer

class MachineDocumentDeleteView(DestroyAPIView):
    queryset = MachineDocument.objects.all()
    serializer_class = MachineDocumentSerializer

class MachineDocumentUpdateMCNOView(APIView):
    def put(self,request,*args,**kwargs):
        val = self.kwargs['val']
        mcno = val.split('_')[0]
        newmcno = val.split('_')[1]
        try:
            MachineDocument.objects.filter(mcno=mcno).update(mcno=newmcno)
            instances =  MachineDocument.objects.all()
            serializer = MachineDocumentSerializer(instance=instances,many=True)
            return Response(serializer.data)
        except Exception as e:
            print("error mc no update update,",e)
            raise APIException
        
class AnnouncementListView(ListAPIView):
    queryset = announcement.objects.all()
    serializer_class = AnnouncementSerializer
    
#Stored Procedure
class testProcedure(ListAPIView):
    serializer_class = AnnouncementSerializer
    #queryset = announcement.objects.raw('''EXEC [ProductionSystem].[dbo].[testProcedure] ['']''')
    def get_queryset(self):
        val = self.kwargs['val']
        val1 = val.split("_")[0]
        val2 = val.split("_")[1]
        qs = announcement.objects.raw("EXEC [ProductionSystem].[dbo].[testProcedure] " + val1 + ",'" + val2 +"'")
        print("EXEC [ProductionSystem].[dbo].[testProcedure] " + val1 + ",'" + val2 +"'")
        return qs
    
class copyPartno(ListAPIView):
    serializer_class = AnnouncementSerializer
    def get_queryset(self):
        val = self.kwargs['val']
        fromSection = val.split("_")[0]
        fromPartno = val.split("_")[1]
        toSection = val.split("_")[2]
        toPartno = val.split("_")[3]
        toPartname = val.split("_")[4]
        toPartmodel = val.split("_")[5]
        qs = announcement.objects.raw("EXEC [ProductionSystem].[dbo].[copyUserSpecifyPartNo] "\
                "'" + fromSection + "','" + fromPartno +"','"+ toSection + "','" + toPartno + "','"\
                "" + toPartname + "','" + toPartmodel + "'")
        return qs