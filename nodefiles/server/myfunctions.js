




exports.convertNewLineToBreak=function(string){

	string=string.toString();

	string=string.replace("\\n","\\n <br> ");

	return string;

}

exports.replaceCReturnWithBreak=function(string){


	string =string.toString();

	string=string.replace("\\r"," <br> ");

	return string;

}

exports.removeCReturn=function(string,fn)
{
	


	string=string.toString();



	string=string.replace(/(?:\r\n|\r)/g,'\n');

	fn(string);
}

exports.compare=function(string1,string2){

	string1=string1.split("");

	string2=string2.split("");


}