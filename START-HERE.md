# आधी हे वाच — ElectroHub

हा नवीन **React + Spring Boot + MySQL** project आहे. जुना MongoDB backend यात वापरू नकोस.

## पहिल्यांदा

1. `README.md` मधल्या prerequisites प्रमाणे Java 17+, Maven, Node 22.12+ आणि MySQL install कर.
2. `database/setup.sql` मध्ये स्वतःचा database password लिही.
3. `ElectroHub` folder मध्ये terminal उघडून:

```bash
sudo mysql < database/setup.sql
cd backend
python3 setup_local.py
python3 run_local.py
```

Setup विचारेल तेव्हा owner email/password आणि वरचा MySQL password दे. Backend terminal सुरू ठेव.

4. दुसऱ्या terminal मध्ये `ElectroHub/frontend` उघड:

```bash
npm ci
npm run dev
```

5. Browser: **http://localhost:5173**

## Login

- वरचा user icon → एकच Sign In page.
- Setup मध्ये दिलेला owner email/password → admin dashboard.
- Sign Up → customer account. ग्राहक कितीही तयार करता येतील.
- Admin फक्त एक; admin signup / seller / sell device पर्याय नाहीत.

## Images

Owner login → Products → Add / Edit → मुख्य image आणि gallery upload → Save.
Categories → Edit → photo upload → Save.

Images साठी Cloudinary लागत नाही. Backend मधला `uploads` folder delete करू नकोस.

## Payment

`backend/.env` मध्ये Razorpay test Key ID, API Secret आणि तुझा webhook secret भर. Backend restart कर.

Local webhook:

```bash
ngrok http 8080
```

Razorpay webhook URL: `https://YOUR-NGROK-HOST/api/payments/webhook`
Events: `payment.captured`, `order.paid`. Dashboard Secret आणि `.env` Secret सारखेच ठेव.

पूर्ण steps आणि troubleshooting `README.md` मध्ये आहेत.

**Demo products आधीच दिले आहेत. Live payments सुरू करण्याआधी स्वतःचे खरे products, prices, stock आणि shop policies भर.** जुने MongoDB users/orders या नवीन database मध्ये आपोआप migrate होत नाहीत.
