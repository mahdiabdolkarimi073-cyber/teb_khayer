export async function sendSMSCode(phone: string, code: string) {
	return await fetch("https://api.sms.ir/v1/send/verify", {
		method: "POST",
		headers: {
			"X-API-KEY": "EIRbpHiltcCYi0F1DOcpxYOpXfdthSUyJWu1XXThKaRCF8VuGLySVI2cMrBAYIjE",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			"mobile": (+phone)+"",
			"templateId": 527837,
			"parameters": [
				{
					"name": "CODE",
					"value": code
				}
			]
		})
	}).then(async (r)=>{
		const json = await r.json();
		console.log(phone,code,json);
		return json;
	});
}
