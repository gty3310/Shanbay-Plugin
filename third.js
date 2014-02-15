

function getShanbayWord(word, callback) 
{
	var url = "http://www.shanbay.com/api/v1/bdc/search/?word=" + word;
	jQuery.ajax({
		url : url,
		type : 'GET',
		dataType : 'JSON',
		contentType : "application/json; charset=utf-8",
		success : function(data) {
			// console.log(data);
			if (data.status_code == 0 && data.msg == "SUCCESS") {
				callback(word, "OK", data.data);
			} else {
				callback(word, data.msg);
			}
		},
		error : function() {
			callback(word, "查询失败，<br>可能 . . . ");
		},
		complete : function() {
		}
	});
}


function addShanbayWord(word, callback) 
{
	var url = "http://www.shanbay.com/api/learning/add/" + word;
	jQuery.ajax({
		url : url,
		type : 'GET',
		dataType : 'JSON',
		contentType : "application/json; charset=utf-8",
		success : function(data) {
			//console.log(data);
			if (data['id']) {
				callback("OK");
			} else {
				callback("添加失败.");
			}
		},
		error : function() {
			callback("添加失败，<br>可能没有", "nologin");
		},
		complete : function() {
		}
	});
}


function forgetShanbayWord(learning_id, callback) 
{
	var url = "http://www.shanbay.com/api/v1/bdc/learning/" + learning_id;
	jQuery.ajax({
		url : url,
		type : 'PUT',
		dataType : 'JSON',
		contentType : "application/json; charset=utf-8",
		data : '{"retention": 1}',
		success : function(data) {
			// console.log(data);
			if (data.status_code == 0 && data.msg == "SUCCESS") {
				callback("OK");
			} else {
				callback("操作失败. " + data.msg);
			}
		},
		error : function() {
			callback("操作失败.");
		},
		complete : function() {
		}
	});
}

function getTranslate(word, callback)
{
	var url = "http://translate.google.cn/translate_a/t?client=t&sl=zh-CN&tl=en&hl=en&sc=2&ie=UTF-8&oe=UTF-8&prev=btn&srcrom=1&ssel=6&tsel=3&q={{text}}";

	var parse = function(data) {
		// console.log(data);
		var result = eval(data); // JSON.parse(data) does not work 
		// console.log(result);
		var translate = [];
		for (i in result[1]) {
			for (j in result[1][i][2]) {
				var one = result[1][i][2][j][0];
				var des = result[1][i][2][j][1].join("；") + ". " + result[1][i][0];
				translate.push([one, des]);
			}
		}
    	return translate;
    };
	jQuery.get(encodeURI(url.replace("{{text}}", word)), function(data){
		var result = "OK";
		var translate = parse(data);
		if (translate.length === 0) {
			result = "翻译失败，没有对应的单词。";
		}
		callback(word, result, translate);
	}).fail(function(){
		callback(word, "查询失败，<br>可能 . . . ", []);
	});
}

function getFromIciba(word, callback)
{
    var url = "http://www.iciba.com/" + word.toLowerCase();
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 ) {
        	if(xhr.status == 200) {
				var ReferType = ["复数", "过去式", "过去分词", "现在分词", "第三人称单数", "比较级", "最高级"];
	        	var ReferList = []; 
	        	var DeriveType = ["派生词"];
	        	var DeriveList = [];
	        	var t0 = $(xhr.responseText.replace(/<img[^>]*>/g,"")).find('.group_prons .group_inf');
	        	t0.each(function(index) {    		
	    			var t1 = $(this).find('ul li');
	    			t1.each(function(j) {
	    				var v = this.innerText.trim().split('：');
	    				var d = v[0].trim();
	    				var c = v[1] ? v[1].trim().split(' ') : null;
	    				if (c) {
	    					for (var i = 0; i < c.length; i++) {
	    						c[i] = c[i].trim();
	    					}
	    				}
	    				if (ReferType.indexOf(d) !== -1 && c && c.length > 0) {
							ReferList.push([d, c]);
	    				}
	    				if (DeriveType.indexOf(d) !== -1 && c && c.length > 0) {
							DeriveList.push([d, c]);
	    				}
	    			});
	        	});
	        	// console.log(ReferList);
	            callback(ReferList, DeriveList);
        	} else {
        		callback([], []);
        	}
        } 
    }
    xhr.send();
}

function getFromYoudao(word, callback)
{
	var url = "http://dict.youdao.com/search?q=" + word.toLowerCase();
	var parse = function(data) {
		var SynonymList = []; 
    	var t0 = $(data.replace(/<img[^>]*>/g,"")).find('#synonyms');
    	t0.each(function() {    		
			var t1 = $(this).find('ul li');
			t1.each(function(){
				var d = this.innerText.trim();
				var c = [];
				var t2 = $(this).next('p');
				var t3 = t2.find('a');
				t3.each(function(){
					c.push(this.innerText.trim());
				});
				SynonymList.push([d, c]);
			});
    	});
    	// console.log(SynonymList);
    	return SynonymList;
    };
	jQuery.get(url, function(data){
		callback(parse(data));
	}).fail(function(){
		callback([]);
	});
}

function commaNumber(n) 
{
	n = "" + n;
	if (n > 999) {
		var chunks = [];
		for (var i = 0, l = Math.ceil(n.length / 3); i < l; i++) {
			var end = n.length - (i * 3);
			chunks[(l - 1) - i] = n.substring(Math.max(0, end - 3), end)
		}
		n = chunks.join(",")
	}
	return n
}

function normalizeFrequency(freq)
{
	if (freq == 0.0) {
		return "∞";
	}
	return commaNumber(1 + parseInt(""+ (1 / (freq / 4000))));
}

function getFrequency(word, callback) 
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var frequence = null;
				var family = [];
				// http://stackoverflow.com/questions/4825312/using-jquery-to-select-custom-fbml-like-tags
				var t0 = $(this.responseText.replace(/<img[^>]*>/g,"")).find('vcom\\:wordfamily');
				t0.each(function() {
					var t1 = $(this).attr('data'); // why prop() failed?
			/*
					var example = [ {
						ffreq: 2.370358182506718, // word family freqency including self and all desendants but excluding parent
						freq: 2.367312319622287, // word self freqency
						hw: true, // 
						parent: "addict", // direct parent string
						size: 3, //
						type: 1, // 
						word: "addicted" // word self string
					} ]
			*/
					try {
						var v = eval(t1);
						for (var i in v) {
							var f = {
								word : v[i].word,
								ffreq : v[i].ffreq,
								freq : v[i].freq,
								fpages : normalizeFrequency(v[i].ffreq),
								pages : normalizeFrequency(v[i].freq)
							};
							console.log(f);
							if (v[i].word == word) {
								frequence = f;
							}
							family.push(f);
						}
					} catch (e) {

					}
				});
				callback("OK", frequence, family);
			} else {
				callback("NO");
			}
		}
	};
	xhr.open("GET", "http://www.vocabulary.com/dictionary/" + word, true);
	xhr.send();
}
