$(document).ready(function() {
    var self = this;
    var input = {};
    var color = 0;
    input.W = 8;
    input.H = 12;
    input.M = 0;
    input.K = 0;
    input.sname = [];
    input.color = [];
    input.volume = [];
    input.pour = [];

    for (var i=0 ; i<9 ; i++){
		$("select.controll").append("<option value="+i+">"+i+"</option>");
    };
    for (var i=1 ; i<9 ; i++) {
    	$("select.material").append("<option value="+i+">"+i+"</option>");
    }
    for (var i=0 ; i<12 ; i++){
        $("tbody.plate").append("<tr class='plate "+i+"'></tr>");
    };
    for (var i=0 ; i<8 ; i++){
		$("tr.plate").append("<th title='' class='"+i+"''>&nbsp;</th>");
    };
    $("th").popover({
	    trigger: 'hover'
	})
    $("input.material").keypress(function(e){
	if ( e.which == 13 ) {
	    $("table.material").append("<tr><th>"+$("input.material").val()+"</th></tr>");
	    $("div.product_name").append("<div class='left name'><div class='material_name'>"+$("input.material").val()+"</div><input class='material_value' type='number' name='namae' maxlength='20'>μl</div>");

	    input.sname.push($("input.material").val());
	    input.color.push(color++);
	    input.M++;

	    $("input.material").val("");
	    return false;
	}
    });
    $("button.controll").click(function(){
	$("div.controll").append("コントロール: <input type='text' name='namae' maxlength='20'>");
    });
    $("button.material").click(function(){
	$("table.material").append("<tr><th>"+$("input.material").val()+"</th></tr>");
	$("div.product_name").append("<div class='left name'><div class='material_name'>"+$("input.material").val()+"</div><input class='material_value' type='number' name='namae' maxlength='20'>μl</div>");

	input.sname.push($("input.material").val());
	input.color.push(color++);
	input.M++;

	$("input.material").val("");
    });
    $("button.product").click(function(){
	var text = "<tr><th>";
	var mate = [];
	$("input.material_value").each(function(){
	    text+=$(this).parent().children("div.material_name").text()+" : "+$(this).val()+" ,   ";
	    mate.push(Number($(this).val()));
	});
	input.pour.push(Number($("select.material").val()));
	input.volume.push(mate);
	text+="計"+$("select.material").val()+"個</th></tr>";
	$("tbody.product_list").append(text);
	input.K++;
    });
    $("button.code").click(function(){
	var POT_VOLUME_MAX = 300;
	input.N = Number($("select.controll").val());

	//solve()
	var tableInfo = solve(input);
	var runJson = tableToJson( input, tableInfo );
	var table_i = 0;
	var table_j = 0;
	for (table_i=0 ; table_i<12 ; table_i++) {
		for (table_j=0 ; table_j<8 ; table_j++) {
			var table = $($("tr."+(11-table_i)).children()[table_j]);
			if (tableInfo.kind[table_j][table_i] === 0) {
				table.css("background-color","#"+("00000"+tableInfo.color[table_j][table_i].toString(16)).substr(("00000"+tableInfo.color[table_j][table_i].toString(16)).length-6));
				table.attr('title','コントロール');
			};
			if (tableInfo.kind[table_j][table_i] === 1) {
				table.css("background-color","#"+("00000"+tableInfo.color[table_j][table_i].toString(16)).substr(("00000"+tableInfo.color[table_j][table_i].toString(16)).length-6));
				var title_text = '原料:';
			    title_text+=input.sname[tableInfo.fie[table_j][table_i]];
				table.attr('title',title_text);
			};
			if (tableInfo.kind[table_j][table_i] === 2) {
				var title_text = '生成物';
				table.css("background-color","#"+("00000"+tableInfo.color[table_j][table_i].toString(16)).substr(("00000"+tableInfo.color[table_j][table_i].toString(16)).length-6));
				for (var i=0; i<input.M ; i++) {
					title_text+=",  "+input.sname[i]+" : "+input.volume[tableInfo.fie[table_j][table_i]][i]+"μl";
				};
				table.attr('title',title_text);
			};
		};
	};

	//このへんてきとーだよ
	var downloadFile = JSON.stringify(runJson);
	var a = $(".download_link");
	var url = window.URL.createObjectURL(new Blob([downloadFile], {type: 'text.plain'}));
	a.attr( 'download', $('#project_name').val()+".json" );
	a.attr( 'href', url );	    	    
    });
});


var POT_VOLUME_MAX = 300; //試験官のサイズ300μl


// input is jsonObject
/*  
 .N : Number of Controle
 .M : Number of Sozai
 .K : Number of Mix
 .W : width of field
 .H : Height of field
 .sname[i] : i-th sozai's name
 .color[i] : i-th sozai's color
 .volume[i][j] : Number of i-th Mix has j-th Sozai's volume (μl)
 .pour[i] : Number of needed i-th Mix (必要な数)
 //現在orderは未実装
 .isorder[i] : if Mix has order, it is true. else false. 
 */
// output is json
/*
 .kind[x][y] : (x, y) test tube is kind ( nothing(-1), controle(0) or sozai(1) or mix(2) )
 .fie[x][y] : (x, y) test tube is id
 .need[x][y] : (x, y) test tube is needed sozai (必要となる量) (μl)
 .color[x][y] : (x, y) test tube is color
 */
function solve(input){    
    var N = input.N;
    var M = input.M;
    var K = input.K;
    
    if( input.W > input.H ) input.W = [ input.H, input.H = input.W ][0];
    var W = input.W;
    var H = input.H;
    
    var sname = new Array(M);
    var color = new Array(M);
    for( var i=0; i < M; i++){
	sname[i] = input.sname[i];
	//random now- > _ <
	color[i] = Math.floor(Math.random()*0xFFFFFF);
	//input.color[i];
    }


    var sum_mix=0;
    var volume = new Array(K);
    var pour = new Array(K);
    for(  i=0; i < K; i++){
	volume[i] = new Array(M);
	pour[i] = input.pour[i];
	sum_mix += pour[i];

	var sum_m = 0;
	for( var j=0; j < M; j++){
	    volume[i][j] = input.volume[i][j];
	    sum_m += volume[i][j];
	}

	//混合する量多すぎいいいいいいいい
	if( sum_m > POT_VOLUME_MAX ) return undefined;
    }

    //ここまでinput
    //ここからoutput

    //result 用 arrayを生成
    var result = new Array();
    var want = new Array(M); // i番目の素材が何μlほしいか
    for( i=0;i<M;i++) want[i] = 0;
    result["kind"] = new Array(W);
    result["fie"] = new Array(W);
    result["need"] = new Array(W);
    result["color"] = new Array(W);
    for( var x=0;x<W;x++){
	result["kind"][x] = new Array(H);
	result["fie"][x] = new Array(H);
	result["need"][x] = new Array(H);
	result["color"][x] = new Array(H);
	for( var y=0;y<H;y++ ){
	    result["kind"][x][y] = -1;
	}
    }

    for( i=0;i<K;i++) {
	for( j=0;j<M;j++ ){
	    want[j] += volume[i][j];	   
	}
    }
    
    //まず無理
    if( N + M + sum_mix > W*H ) return undefined;
    
    var des1 = Math.ceil( N / H );
    var des2 = Math.ceil( M / H );
    
    //詰めればいけれるだろうけど綺麗にわけれない
    if( (des1+des2) > H ) return undefined;
    if( (des1 + des2) * W + sum_mix > H*W ) return undefined;

    //コントロールを配置
    var cnt = N;
    x=0;
    while( cnt > 0 ){
	for( i = 0; i < des1 && cnt > 0; i++){
	    result.kind[x][i] = 0;
	    result.fie[x][i] = 0;
	    cnt--;	    
	}
	x++;
    }

    //素材を配置
    cnt = M;
    x=0;
    var now_v = want[cnt-1];
    while( cnt > 0 ){
	for( i=des1;i<des1+des2 && cnt > 0;i++ ){
	    result.kind[x][i] = 1;
	    result.fie[x][i] = cnt-1;
	    result.need[x][i] = Math.min( 300, now_v );
	    now_v -= 300;
	    if( now_v <= 0 ){
		cnt--;
		now_v = want[cnt-1];		
	    }
	}
	x++;
    }

    //混合後を配置
    cnt = K;
    for( i=H-1;i>=des1+des2&&cnt>0;i-- ){
	if( pour[cnt-1] > W ) return undefined;
	for( x=0;x<pour[cnt-1];x++){//ここバグあるよ	    
	    result.kind[x][i] = 2;
	    result.fie[x][i] = cnt-1;
	}
	cnt--;
    }

    //綺麗に置けない
    if( cnt > 0 ) return undefined;

    for( x=0; x<W; x++ ){
	for( y=0;y<H;y++ ){
		result["color"][x][y]=0;
	    if( result.kind[x][y] == 0 ){
		result.color[x][y] = 0xFF0000;
	    } else if( result.kind[x][y] == 1 ){
		result.color[x][y] = color[ result.fie[x][y] ];
	    } else if( result.kind[x][y] == 2 ){
		for( i=0;i<M;i++ ){
		    if( volume[result.fie[x][y]][i] > 0 )
			result.color[x][y] += color[ i ]*volume[result.fie[x][y]][i];
			result.color[x][y] %= 0x1000000;

		}
	    } else {
	        result["color"][x][y] = 0x101010;
	    }
	}
    }

    return result;    
}



//ピペットの名前
var Pipette_Name = "p1000-rack";
//ピペットの labware
var Tiprack_1000 = "tiprack-1000ul";
//plateのlabware
var Plate_labware = "96-PCR-flat";
//ピペット1000
var Pipette1000 = "p1000";
//これはフィールドにある溶液の種類とかから移動のjsonを出力するましーーーんです。
// input is json
/*
 .kind[x][y] : (x, y) test tube is kind ( nothing(-1), controle(0) or sozai(1) or mix(2) )
 .fie[x][y] : (x, y) test tube is id
 .need[x][y] : (x, y) test tube is needed sozai (必要となる量) (μl)
 */
// output is json
/*
 result : 出力用json(これを使えば動く)
 */
function tableToJson( input, plane ){
    var W = input.W, H = input.H;
    var result = 
	    {
		"deck" : {
		    "p1000-rack" : {
			"labware" : Tiprack_1000
		    },
		    "plate" : {
			"labware" : Plate_labware
		    },
		    "trash" : {
			"labware" : "point"
		    }
		},
		
		"head" : {
		    p1000 : {
      			"tool" : "pipette",
      			"tip-racks" : [
        		    {
       		   		"container" : Pipette_Name
        		    }
      			],
			"trash-container": {
			    "container": "trash"
			},
			"multi-channel": false,
			"axis": "b",
			"volume": 200,
			"down-plunger-speed": 300,
			"up-plunger-speed": 500,
			"tip-plunge": 6,
			"extra-pull-volume": 0,
			"extra-pull-delay": 200,
			"distribute-percentage": 0.1,
			"points": [
			    {
				"f1": 1,
				"f2": 1
			    },
			    {
				"f1": 5,
				"f2": 5
			    },
			    {
				"f1": 7,
				"f2": 7
			    },
			    {
				"f1": 10,
				"f2": 10
			    }
			]
			
		    }
		},
		
		"ingredients": {}, 
		"instructions": [
		    {
			"tool": "p1000", 
			"groups": []
		    }
		]
	    };

    var used = new Array( W );
    for( var x = 0; x<W; x++ ){
	used[x] = new Array(H);
	for( var y=0;y<H;y++ ){
	    used[x][y] = new Array( input.M );
	    for( var i=0;i<input.M;i++ )
		used[x][y][i] = false;
	}
    }

    var alp="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for( x=0;x<W;x++ ){
	for( y=0;y<H;y++ ){
	    if( plane.kind[x][y] == 1 ){//素材である。
		var move = {
		    "distribute": {
			"from": {
                            "container": "plate", 
                            "location": alp[x]+(y+1).toString()
			},
			"to":[			    
			]
		    }
		};
		var now_v = plane.need[x][y];
		
		for( var x2=0;x2<W;x2++ ){
		    for( var y2=0;y2<H;y2++ ){
			if( used[x2][y2][plane.fie[x][y]] ) continue;
			if( plane.kind[x2][y2] == 2 ){
			    if( input.volume[plane.fie[x2][y2]][plane.fie[x][y]] > 0 &&
				now_v - input.volume[plane.fie[x2][y2]][plane.fie[x][y]] >= 0 ){
				    var tot={
					"container": "plate", 
					"location": alp[x2]+(y2+1).toString(), 
					"volume": input.volume[plane.fie[x2][y2]][plane.fie[x][y]], 
					"touch-tip": false
				    };
				    move.distribute.to.push( tot );
				    used[x2][y2][plane.fie[x][y]] = true;
				}
			}
		    }
		}
		result.instructions[0].groups.push( move );
	    }
	}
    }
    return result;
}


