/* global web, visualization, ClassVisualization */

ClassVisualization.prototype.load_visualization = function(){

    var self = this;

    var sampleData = this.sampleData;

    var urlImg = "../image/?ch=" + getUrlParameter("ch") + "&task=" + getUrlParameter("task") + "&sample=" + getUrlParameter("sample") +  "&gtv=" + getUrlParameter("gtv");

    var template = "<div class='im_filters'><input type='checkbox' checked='checked' id='chk_image'><label for='chk_image'>Show Image</label></div>"+
                    "<div class='container_canvas'>" +
                    "<h3>Ground Truth</h3>" +
                    "<div id='div_canvas_gt'></div>" +
                   "</div>"+
                   "<div class='container_canvas'>" +
                    "<h3>Detection</h3>" +
                    "<div id='div_canvas_det'></div>" +
                   "</div>"+
                   "<div class='container_canvas_rec'>" +
<<<<<<< HEAD
                   "<h3 >Recognition</h3>" +
                    "<div class='div_sample_info_rec' id='div_canvas_reg'></div>" +
=======
                    "<h3>Recognition</h3>" +
                    "<div id='div_canvas_reg'></div>" +
>>>>>>> 83a48414362e5e1cd9da25c2cb26a165f9410be6
                   "</div>"+
                   "<img id='img_gt_image2'>"+
                   "<div id='div_sample_info'>"+
                   "<div id='div_recall'><div class='div_table'><h3>Recall</h3>loading..</div></div>"+
                   "<div id='div_precision'><div class='div_table'><h3>Precision</h3>loading..</div></div>"+
                   "<div id='div_char'><div class='div_table'><h3>Character score</h3>loading..</div></div></div>"+
                   "<div id='div_logs'><h3>Log</h3><span class='red'>loading..</span></div>";
    
    $("#div_sample").html(template);

    if(!this.image_details_loaded){
        this.image_details_loaded=true;
        this.init_image_details();
    }   
    this.image_loaded = false;
    this.draw();
    
    $("#chk_image").change(function(){
        self.draw();
    });
    
    $("#img_gt_image2").attr("src",urlImg).one("load",function(){
        self.image_loaded = true;
        self.im_w = this.width;
        self.im_h = this.height;
        self.scale = Math.min($("#div_canvas_gt").width()/self.im_w,$("#div_canvas_det").height()/self.im_h );
        self.zoom_changed();
        self.correct_image_offset();
        self.draw();
    });

    var numGt = sampleData.gtPolPoints==undefined? 0 : sampleData.gtPolPoints.length;
    var numDet = sampleData.detPolPoints==undefined? 0 : sampleData.detPolPoints.length;

    var html_recall = "";
    var html_precision = "";

        var stylesMat = new Array();
        for ( var j=0;j<numGt;j++){
            stylesMat[j] = new Array();
            for ( var i=0;i<numDet;i++){
                stylesMat[j][i] = "value";
            }
        }
        
        sampleData.gtTypes = new Array();
        sampleData.detTypes = new Array();
        for ( var j=0;j<numGt;j++){
            var gtDontCare = $.inArray(j,sampleData.gtDontCare)>-1;
            sampleData.gtTypes.push( gtDontCare? 'DC' : 'NM' );
        }
        for ( var j=0;j<numDet;j++){
            var detDontCare = $.inArray(j,sampleData.detDontCare)>-1;
            sampleData.detTypes.push( detDontCare? 'DC' : 'NM' );
        }


        if (sampleData.pairs!=undefined){
            for ( var k=0;k<sampleData.pairs.length;k++){
                var pair = sampleData.pairs[k];
                
                var gts = new Array();
                var dets = new Array();
                
                if(pair.gt.length==undefined){
                    gts.push(pair.gt);
                }else{
                    gts = pair.gt;
                }
                if(pair.det.length==undefined){
                    dets.push(pair.det);
                }else{
                    dets = pair.det;
                }
                for(var i=0;i<gts.length;i++){
                    for(var j=0;j<dets.length;j++){
                        stylesMat[gts[i]][dets[j]] += " " + "OO";
                        sampleData.gtTypes[gts[i]] = "OO";
                        sampleData.detTypes[dets[j]] = "OO";
                    }
                }
            }
        }
    if(numDet>100){
        html_recall = "<p class='red'>The algorithm has detected more than 100 bounding boxes, the visualization are not posible</p></p>";
    }else{        
        var html_recall = "<table><thead><tr><th>GT / Det</th>";
        for ( var i=0;i<numDet;i++){
            var detDontCare = $.inArray(i,sampleData.detDontCare)>-1;
            html_recall += "<th style='" + (detDontCare? "" : "font-weight:bold;") + "'>#" + i + "</th>";
        }
        html_recall += "</tr></thead><tbody id='tbody_recall'>";

        for ( var j=0;j<numGt;j++){
            var gtDontCare = $.inArray(j,sampleData.gtDontCare)>-1;
            html_recall += "<tr>";
            html_recall += "<td style='" + (gtDontCare? "" : "font-weight:bold;") + "'>#" + j + "</td>";
            for ( var i=0;i<numDet;i++){

                var recallClass = (sampleData.recallMat[j][i]>=sampleData.evaluationParams.AREA_RECALL_CONSTRAINT ? ' green' : ' red' );
                html_recall += "<td data-col='" + i + "' data-row='" + j + "' class='" + stylesMat[j][i] + " " + recallClass + "'>" + Math.round(sampleData.recallMat[j][i]*10000)/100 + "</td>";    
            }
            html_recall += "</tr>";
        }
        html_recall += "</tbody></table>";
    }
    $("#div_recall").html("<div class='div_table'><h3>Recall</h3>" + html_recall + "</div>");

    if(numDet>100){
        html_precision = "<p class='red'>The algorithm has detected more than 100 bounding boxes, the visualization are not posible</p></p>";
    }else{        
        var html_precision = "<table><thead><tr><th>GT / Det</th>";
        for ( var i=0;i<numDet;i++){
            var detDontCare = $.inArray(i,sampleData.detDontCare)>-1;
            html_precision += "<th style='" + (detDontCare? "" : "font-weight:bold;") + "'>#" + i + "</th>";
        }
        html_precision += "</tr></thead><tbody id='tbody_precision'>";

        for ( var j=0;j<numGt;j++){
            var gtDontCare = $.inArray(j,sampleData.gtDontCare)>-1;
            html_precision += "<tr>";
            html_precision += "<td style='" + (gtDontCare? "" : "font-weight:bold;") + "'>#" + j + "</td>";
            for ( var i=0;i<numDet;i++){

                var precisionClass = (sampleData.precisionMat[j][i]>=sampleData.evaluationParams.AREA_PRECISION_CONSTRAINT ? ' green' : ' red' );
                html_precision += "<td data-col='" + i + "' data-row='" + j + "' class='" + stylesMat[j][i] + " " + precisionClass + "'>" + Math.round(sampleData.precisionMat[j][i]*10000)/100 + "</td>";    
            }
            html_precision += "</tr>";
        }
        html_precision += "</tbody></table>";
    }
    $("#div_precision").html("<div class='div_table'><h3>Precision</h3>" + html_precision + "</div>");

    if(numDet>100){
        html_char = "<p class='red'>The algorithm has detected more than 100 bounding boxes, the visualization are not posible</p></p>";
    }else{        
        var html_char = "<table><thead><tr><th>GT / Det</th>";
        for ( var i=0;i<numDet;i++){
            var detDontCare = $.inArray(i,sampleData.detDontCare)>-1;
            html_char += "<th style='" + (detDontCare? "" : "font-weight:bold;") + "'>#" + i + "</th>";
        }
        html_char += "<th style='" + "font-weight:bold;" + "'>" + "Rec Score" + "</th>";
        html_char += "</tr></thead><tbody id='tbody_char'>";

        // for ( var j=0;j<numGt;j++){
        //     var gtDontCare = $.inArray(j,sampleData.gtDontCare)>-1;
        //     html_char += "<tr>";
        //     html_char += "<td style='" + (gtDontCare? "" : "font-weight:bold;") + "'>#" + j + "</td>";
        //     for ( var i=0;i<numDet;i++){
        //         var charClass = 'green';
        //         html_char += "<td data-col='" + i + "' data-row='" + j + "' class='" + stylesMat[j][i] + " " + charClass + "'>" + sampleData.charCounts[j][i] + "</td>";
        //     }
        //     html_char += "<td data-col='" + (i+1) + "' data-row='" + j + "' class='" + "value" + " " + charClass + "'>" + sampleData.recallScore[j] + "</td>";
        //     html_char += "</tr>";
        // }

        // html_char += "<tr>";
        // html_char += "<tr><td style='" + "font-weight:bold" + "'>" + "Prec Score" + "</td>";
        // for ( var i=0;i<numDet;i++){
        //     var charClass = 'green';
        //     html_char += "<td data-col='" + i + "' data-row='" + (j+1) + "' class='" + "value" + " " + charClass + "'>" + sampleData.precisionScore[i] + "</td>";
        // }
        // html_char += "<td data-col='" + (i+1) + "' data-row='" + (j+1) + "' class='" + "value" + " " + charClass + "'>" + "</td>";
        // html_char += "</tr>";

        // html_char += "</tbody></table>";

    }
    $("#div_char").html("<div class='div_table'><h3>Character score</h3>" + html_char + "</div>");


    var evalLog = sampleData.evaluationLog;
    if (evalLog==undefined){
        evalLog = "";
    }else{
        evalLog = evalLog.replace(/\n/g, "<br/>")
    }

    $("#div_logs").html("<div class='div_log'><h3>Log</h3>" + evalLog + "</div>");

    this.table_sizes();

    $("#div_matrices tbody td").mouseover(function(){
        self.det_rect = -1;
        self.gt_rect = -1;
        if ( $(this).attr("data-col")!=undefined && $(this).attr("data-row")!=undefined){
            self.det_rect = $(this).attr("data-col");
            self.gt_rect = $(this).attr("data-row");
            $("#div_matrices tbody td").removeClass("selected");
            $("#div_matrices tbody td").removeClass("col_selected").removeClass("row_selected");
            $(this).addClass("selected");
            $("td[data-col=" + $(this).attr("data-col") + "]").addClass("col_selected");
            $("td[data-row=" + $(this).attr("data-row") + "]").addClass("row_selected");
        }
        self.draw();
    });

    $("#div_recall tbody td").mouseover(function(){
        self.det_rect = -1;
        self.gt_rect = -1;
        if ( $(this).attr("data-col")!=undefined && $(this).attr("data-row")!=undefined){
            self.det_rect = $(this).attr("data-col");
            self.gt_rect = $(this).attr("data-row");
            $("#div_recall tbody td").removeClass("selected");
            $("#div_recall tbody td").removeClass("col_selected").removeClass("row_selected");
            $(this).addClass("selected");
            $("td[data-col=" + $(this).attr("data-col") + "]").addClass("col_selected");
            $("td[data-row=" + $(this).attr("data-row") + "]").addClass("row_selected");
        }
        self.draw();
    });

    $("#div_precision tbody td").mouseover(function(){
        self.det_rect = -1;
        self.gt_rect = -1;
        if ( $(this).attr("data-col")!=undefined && $(this).attr("data-row")!=undefined){
            self.det_rect = $(this).attr("data-col");
            self.gt_rect = $(this).attr("data-row");
            $("#div_precision tbody td").removeClass("selected");
            $("#div_precision tbody td").removeClass("col_selected").removeClass("row_selected");
            $(this).addClass("selected");
            $("td[data-col=" + $(this).attr("data-col") + "]").addClass("col_selected");
            $("td[data-row=" + $(this).attr("data-row") + "]").addClass("row_selected");
        }
        self.draw();
    });

    $("#div_char tbody td").mouseover(function(){
        self.det_rect = -1;
        self.gt_rect = -1;
        if ( $(this).attr("data-col")!=undefined && $(this).attr("data-row")!=undefined){
            self.det_rect = $(this).attr("data-col");
            self.gt_rect = $(this).attr("data-row");
            $("#div_char tbody td").removeClass("selected");
            $("#div_char tbody td").removeClass("col_selected").removeClass("row_selected");
            $(this).addClass("selected");
            $("td[data-col=" + $(this).attr("data-col") + "]").addClass("col_selected");
            $("td[data-row=" + $(this).attr("data-row") + "]").addClass("row_selected");
        }
        self.draw();
    });

    this.draw();


};

ClassVisualization.prototype.draw = function(){

    this.ctx_gt.clearRect(0,0,this.canvas_gt.width,this.canvas_gt.height);
    this.ctx_det.clearRect(0,0,this.canvas_gt.width,this.canvas_gt.height);
    this.ctx_reg.clearRect(0,0,this.canvas_gt.width,this.canvas_gt.height);
    
    if(!this.image_loaded){
        this.ctx_det.fillStyle = "rgba(255,0,0,1)";
        this.ctx_det.font= "12px Verdana";
        this.ctx_det.fillText("Loading image..", 20,60);
        this.ctx_gt.fillStyle = "rgba(255,0,0,1)";
        this.ctx_gt.font= "12px Verdana";
        this.ctx_gt.fillText("Loading image..", 20,60);

        this.ctx_reg.fillStyle = "rgba(255,0,0,1)";
        this.ctx_reg.font= "12px Verdana";
        this.ctx_reg.fillText("Loading image..", 20,60);
        return;
    }
    
    
    if( $("#chk_image").is(":checked")){
        this.ctx_gt.drawImage(img_gt_image2,this.offset_x,this.offset_y,this.curr_im_w,this.curr_im_h);
    }else{
        this.ctx_gt.strokeStyle = "rgba(0,0,0,1)";
        this.ctx_gt.strokeRect(this.offset_x,this.offset_y,this.curr_im_w,this.curr_im_h);
        this.ctx_gt.fillStyle = "black";
        this.ctx_gt.fillRect(0, 0, this.canvas_gt.width, this.canvas_gt.height);
    }


    if (this.sampleData==null){
        this.ctx_gt.fillStyle = "rgba(255,0,0,1)";
        this.ctx_gt.font= "12px Verdana";
        this.ctx_gt.fillText("Loading method..", 20,60);        
        this.ctx_det.fillStyle = "rgba(255,0,0,1)";
        this.ctx_det.font= "12px Verdana";
        this.ctx_det.fillText("Loading method..", 20,60);
        return;
    }else{
         if (this.sampleData.gtPolPoints==undefined){
             this.sampleData.gtPolPoints = [];
         }
    }
    
    for (var i=0;i<this.sampleData.gtPolPoints.length;i++){
        
        //if (bb.id_s==current_id_submit){

            var opacity = 0.6;//(gt_rect==bb.i)? "0.9" : "0.6";
            
            var bb = this.sampleData.gtPolPoints[i];
            var type = this.sampleData.gtTypes[i];
            
            var gtDontCare = $.inArray(i,this.sampleData.gtDontCare)>-1;
            
            if(type=="DC"){
                this.ctx_gt.fillStyle = "rgba(50,50,50," + opacity + ")";
            }else if (type=="OO"){
                this.ctx_gt.fillStyle = "rgba(0,190,0," + opacity + ")";
            }else if (type=="NO"){
                this.ctx_gt.fillStyle = "rgba(38,148,232," + opacity + ")";                
            }else{
                this.ctx_gt.fillStyle = "rgba(255,0,0," + opacity + ")";
            }

            if (bb.length==4){

                var x = this.original_to_zoom_val(parseInt(bb[0]));
                var y = this.original_to_zoom_val_y(parseInt(bb[1]));
                var x2 = this.original_to_zoom_val(parseInt(bb[2]));
                var y2 = this.original_to_zoom_val_y(parseInt(bb[3]));
                var w = x2-x+1;
                var h = y2-y+1;
                this.ctx_gt.fillRect(x,y,w,h);
                if(this.gt_rect==i){
                    this.ctx_gt.lineWidth = 2;
                    this.ctx_gt.strokeStyle = 'red';
                    this.ctx_gt.strokeRect(x,y,w,h);
                }  
            }else{
                this.ctx_gt.beginPath();
                this.ctx_gt.moveTo(this.original_to_zoom_val(parseInt(bb[0])), this.original_to_zoom_val_y(parseInt(bb[1])));
                this.ctx_gt.lineTo(this.original_to_zoom_val(parseInt(bb[2])+1), this.original_to_zoom_val_y(parseInt(bb[3])));
                this.ctx_gt.lineTo(this.original_to_zoom_val(parseInt(bb[4])+1), this.original_to_zoom_val_y(parseInt(bb[5])+1));
                this.ctx_gt.lineTo(this.original_to_zoom_val(parseInt(bb[6])), this.original_to_zoom_val_y(parseInt(bb[7])+1));
                this.ctx_gt.closePath();
                this.ctx_gt.fill();

                //ctx_gt.fillRect( original_to_zoom_val(parseInt(bb.x)),original_to_zoom_val_y(parseInt(bb.y)),parseInt(bb.w)*scale,parseInt(bb.h)*scale);
                if(this.gt_rect==i){
                    this.ctx_gt.lineWidth = 2;
                    this.ctx_gt.strokeStyle = 'red';
                    this.ctx_gt.stroke();
                }            
            }

            //pseudo character centers
            // for (var k=0;k<this.sampleData.gtCharPoints[i].length;k++){
            //     var center = this.sampleData.gtCharPoints[i][k];
            //     var count = this.sampleData.gtCharCounts[i][k];

            //     if(count==1){
            //         this.ctx_gt.fillStyle = "rgba(0,190,0," + opacity + ")";
            //     }else{
            //         this.ctx_gt.fillStyle = "rgba(255,0,0," + opacity + ")";
            //     }
                

            //     var x = this.original_to_zoom_val(center[0]);
            //     var y = this.original_to_zoom_val_y(center[1]);
                
            //     this.ctx_gt.beginPath();
            //     this.ctx_gt.arc(x, y, 5, 0, 2 * Math.PI, false);
            //     this.ctx_gt.closePath();
            //     this.ctx_gt.fill();

            //     if(this.gt_rect==i){
            //         this.ctx_gt.lineWidth = 2;
            //         this.ctx_gt.strokeStyle = 'red';
            //         this.ctx_gt.stroke();
            //     }else{
            //         this.ctx_gt.lineWidth = 2;
            //         this.ctx_gt.strokeStyle = "rgba(50,50,50," + opacity + ")";
            //         this.ctx_gt.stroke();
            //     }
            // }
            if(!$("#chk_image").is(":checked")){
                this.writeText(this.ctx_gt,bb,this.sampleData.gtTrans[i]);
            }
        //}
    }


    this.ctx_det.clearRect(0,0,this.canvas_gt.width,this.canvas_gt.height);
    if( $("#chk_image").is(":checked")){
        this.ctx_det.drawImage(img_gt_image2,this.offset_x,this.offset_y,this.curr_im_w,this.curr_im_h);
    }else{
        this.ctx_det.strokeStyle = "rgba(0,0,0,1)";
        this.ctx_det.strokeRect(this.offset_x,this.offset_y,this.curr_im_w,this.curr_im_h);
        this.ctx_det.fillStyle = "black";
        this.ctx_det.fillRect(0, 0, this.canvas_det.width, this.canvas_det.height);
    }    

    for (var i=0;i<this.sampleData.detPolPoints.length;i++){
        var bb = this.sampleData.detPolPoints[i];
        var type = this.sampleData.detTypes[i];

            var opacity = 0.6;//(det_rect==bb.i)? "0.9" : "0.6";
            if(type=="DC"){
                this.ctx_det.fillStyle = "rgba(50,50,50," + opacity + ")";
            }else if (type=="OO"){
                this.ctx_det.fillStyle = "rgba(0,190,0," + opacity + ")";
            }else if (type=="NO"){
                this.ctx_det.fillStyle = "rgba(38,148,232," + opacity + ")";                
            }else{
                this.ctx_det.fillStyle = "rgba(255,0,0," + opacity + ")";
            }

            if (bb.length==4){
                
                var x = this.original_to_zoom_val(parseInt(bb[0]));
                var y = this.original_to_zoom_val_y(parseInt(bb[1]));
                var x2 = this.original_to_zoom_val(parseInt(bb[2]));
                var y2 = this.original_to_zoom_val_y(parseInt(bb[3]));
                var w = x2-x+1;
                var h = y2-y+1;
                this.ctx_det.fillRect(x,y,w,h);
                if(this.det_rect==i){
                    this.ctx_det.lineWidth = 2;
                    this.ctx_det.strokeStyle = 'red';
                    this.ctx_det.strokeRect(x,y,w,h);
                }   
                
            }else{
                this.ctx_det.beginPath();
                // this.ctx_overlay.beginPath();
                this.ctx_det.moveTo(this.original_to_zoom_val(bb[0]), this.original_to_zoom_val_y(bb[1]));
                // this.ctx_overlay.moveTo(this.original_to_zoom_val(bb[0]), this.original_to_zoom_val_y(bb[1]));
                for (var idx = 2; idx < bb.length; idx += 2) {
                    this.ctx_det.lineTo(this.original_to_zoom_val(parseInt(bb[idx])), this.original_to_zoom_val_y(parseInt(bb[idx+1])));
                    // this.ctx_overlay.lineTo(this.original_to_zoom_val(parseInt(bb[idx])), this.original_to_zoom_val_y(parseInt(bb[idx+1])));
                }
                this.ctx_det.closePath();
                // this.ctx_overlay.closePath();
                this.ctx_det.fill();
                // this.ctx_overlay.fill();
                //ctx_gt.fillRect( original_to_zoom_val(parseInt(bb.x)),original_to_zoom_val_y(parseInt(bb.y)),parseInt(bb.w)*scale,parseInt(bb.h)*scale);
                if(this.det_rect==i){
                    this.ctx_det.lineWidth = 2;
                    this.ctx_det.strokeStyle = 'red';
                    this.ctx_det.stroke();
                }
                // draw overlay line
                // this.ctx_overlay.lineWidth = 2.5;
                // this.ctx_overlay.strokeStyle = 'blue';
                // this.ctx_overlay.stroke();

            var TL,TR,BL,BR;

            if (bb.length == 8){
                //bb has 8 points, we want to find TL,TR,BL,BR
                //1st. sort points by Y
                var p1 = {"x":bb[0],"y":bb[1]};
                var p2 = {"x":bb[2],"y":bb[3]};
                var p3 = {"x":bb[4],"y":bb[5]};
                var p4 = {"x":bb[6],"y":bb[7]};

                var pointsList = [p1,p2,p3,p4];
                pointsList = pointsList.sort(function sortPointsByY(a,b){
                    if (a.y<b.y){
                        return 1;
                    }else if (a.y==b.y){
                        return 0;
                    }else{
                        return -1;
                    }
                });

                if (pointsList[0].x < pointsList[1].x){
                        TL = pointsList[0];
                        TR = pointsList[1];
                    }else{
                        TL = pointsList[1];
                        TR = pointsList[0];
                    }
                if (pointsList[2].x < pointsList[3].x){
                        BL = pointsList[2];
                        BR = pointsList[3];
                    }else{
                        BL = pointsList[3];
                        BR = pointsList[2];
                    }
                }else if (bb.length == 4){
                TL = {"x" : bb[0] , "y":bb[3]};
                TR = {"x" : bb[2] , "y":bb[3]};
                BL = {"x" : bb[0] , "y":bb[1]};
                BR = {"x" : bb[2] , "y":bb[1]};
            } else {
                // bb has 2*N points. we want to find TL, TR, BL, BR point to cover polygon
                var num_points = Math.round(bb.length/2);
                BL = {"x" : bb[0] , "y":bb[1]};
                BR = {"x" : bb[num_points-2] , "y":bb[num_points-1]};
                TR = {"x" : bb[num_points] , "y":bb[num_points+1]};
                TL = {"x" : bb[2*num_points-2] , "y":bb[2*num_points-1]};
            }
<<<<<<< HEAD
=======
            
>>>>>>> 83a48414362e5e1cd9da25c2cb26a165f9410be6
            if (document.getElementById('rec_canvas_'+i) == undefined){
                var xcoors = [];
                var ycoors = [];
                for (var j=0;j<bb.length - 1;j+=2){
                    xcoors.push(bb[j]);
                    ycoors.push(bb[j+1]);
                }
                var xmax_coor = Math.max(...xcoors);
                var ymax_coor = Math.max(...ycoors);
                var xmin_coor = Math.min(...xcoors);
                var ymin_coor = Math.min(...ycoors);
<<<<<<< HEAD


=======
>>>>>>> 83a48414362e5e1cd9da25c2cb26a165f9410be6
                let rec_canvas = document.createElement('canvas');
                // let sx = Math.min(
                //     TR.x,TL.x,BR.x,BL.x
                // )
                // let sy = Math.min(
                //     TR.y,TL.y,BR.y,BL.y
                // )
                // let width = Math.max(
                //     Math.abs(TR.x-TL.x),
                //     Math.abs(BR.x-BL.x)
                // )
                // let height = Math.max(
                //     Math.abs(TR.y-BR.y),
                //     Math.abs(TL.y-BL.y)
                // )
                let sx = xmin_coor;
                let sy = ymin_coor;
                let width = Math.abs(xmax_coor - xmin_coor);
                let height = Math.abs(ymax_coor - ymin_coor);
                let coors = [sx,sy,width,height];
                rec_canvas.setAttribute("id","rec_canvas_"+i);
                document.getElementById("div_canvas_reg").appendChild(rec_canvas);
                drawRec(
<<<<<<< HEAD
                    "rec_canvas_"+i,coors,this.sampleData.detTrans[i]
=======
                    [],"rec_canvas_"+i,coors,this.sampleData.detTrans[i]
>>>>>>> 83a48414362e5e1cd9da25c2cb26a165f9410be6
                )
            }
            else {
            }
            }
            if( !$("#chk_image").is(":checked")){
                this.writeText(this.ctx_det,bb,this.sampleData.detTrans[i]);
            }
    }
    this.draws++;
};

<<<<<<< HEAD
function drawRec(id,coors,text) {
=======
function drawRec(idata,id,coors,text) {
>>>>>>> 83a48414362e5e1cd9da25c2cb26a165f9410be6
    const img = new Image();
    let sx, sy, sWidth, sHeight;
    [sx, sy, sWidth, sHeight] = coors;
    const canvas =  document.getElementById(id);
    const ctx = canvas.getContext('2d');
    img.onload = () => {
        // ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        ctx.canvas.width  = 400;
        ctx.canvas.height = 50;
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 70, 0, 120, 50);
        var fontSize = 20;

        // console.log(coors,text);
        ctx.fillStyle = "rgba(255,0,0,1)";
        ctx.font= fontSize + "px Verdana";
        ctx.strokeStyle = 'red';
        var metrics = ctx.measureText(text);
        var textWidth = metrics.width;
    
        metrics = ctx.measureText(text);
        textWidth = metrics.width;
        ctx.fillText(text, 200 , 40);
    };
    img.src = document.getElementById('img_gt_image2').src;

<<<<<<< HEAD
    // var height = Math.round(this.original_to_zoom_val_y(parseInt( Math.min(TL.y,TR.y) )+1) - this.original_to_zoom_val_y(parseInt(Math.max(BL.y,BR.y)))) - 3;
    // var width = Math.round(this.original_to_zoom_val(parseInt( Math.min(TR.x,BR.x) )+1) - this.original_to_zoom_val(parseInt(Math.max(TL.x,BL.x)))) - 3;



=======
>>>>>>> 83a48414362e5e1cd9da25c2cb26a165f9410be6
}
