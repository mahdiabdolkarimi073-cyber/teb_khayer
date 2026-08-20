import {Box} from "@mantine/core";


const Privacy = () => {
    return (
        <Box style={{
            "* p": {
                textAlign: "justify"
            }
        }} className="container mx-auto p-4 flex flex-col gap-3 max-w-[600px] my-[30px]">

            <h1 className="text-3xl font-bold mb-4 text-center">حریم خصوصی</h1>
            <div className="mb-8">
                <p className={'text-red-500'}>شماره تلفن شما تنها برای مراحل ثبت نام استفاده خواهد شد و به هیچ وجه به اشتراک گذاشته نخواهد شد.</p>
            </div>

            <div className="mb-8  flex flex-col gap-3">
                <h2 className="text-xl font-semibold mb-1">اطلاعات جمع‌آوری شده</h2>

                <div>
                    <h3 className={'text-[20px] font-bold'}>
                        <span className={'text-blue-400 mx-2'}>1-1.</span>
                        اطلاعات نصب و استفاده از نرم‌افزار
                    </h3>
                    <p>
                        با نصب و استفاده از نرم‌افزار طب خیر، برخی اطلاعات از دستگاه شما به صورت خودکار جمع‌آوری می‌شود. این اطلاعات شامل نوع دستگاه، زبان و نوع سیستم عامل، جست‌وجوها، مدت استفاده، و اطلاعات فنی مربوط به دستگاه شما می‌شوند.
                    </p>
                </div>
            </div>


            <div className="mb-8 flex flex-col gap-3">
                <h2 className="text-xl font-semibold mb-1">استفاده از اطلاعات</h2>
                <div>
                    <h3 className={'text-[20px] font-bold'}>
                        <span className={'text-blue-400 mx-2'}>2-1.</span>
                        اجرای قرارداد و بهبود خدمات
                    </h3>
                    <p>
                        اطلاعات شخصی جمع‌آوری شده برای اجرای قرارداد با شما و بهبود خدمات طب خیر استفاده می‌شود. این شامل بهبود تجربه کاربری، افزایش امنیت، و ارائه خدمات بهتر به شما می‌شود.
                    </p>
                </div>
                <div>
                    <h3 className={'text-[20px] font-bold'}>
                        <span className={'text-blue-400 mx-2'}>2-2.</span>
                        ارتقاء اطلاعات و اطلاع‌رسانی
                    </h3>
                    <p>
                        اطلاعات جمع‌آوری شده برای ارتقاء عملکرد سایت و نرم‌افزار، نمایش تبلیغات و پیشنهادات شخصی‌سازی‌شده، و اطلاع‌رسانی در مورد به‌روزرسانی‌ها و رویدادهای مهم استفاده می‌شود.
                    </p>
                </div>
                <div>
                    <h3 className={'text-[20px] font-bold'}>
                        <span className={'text-blue-400 mx-2'}>2-3.</span>
                        دفاع و پاسخ به دعاوی
                    </h3>
                    <p>
                        در صورت نیاز، اطلاعات شخصی برای دفاع در برابر دعاوی حقوقی یا اداری مورد استفاده قرار می‌گیرد.
                    </p>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">حقوق شما</h2>
                <p>
                    شما حق دارید که اطلاعات شخصی خود را مشاهده، اصلاح، یا حذف کنید. همچنین، می‌توانید از ما خواسته کنید که اطلاعات شما را به اشتراک نگذاریم یا استفاده از آن را محدود کنیم.
                </p>
            </div>
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">کوکی‌ها</h2>
                <p>
                    ما ممکن است از کوکی‌ها برای جمع‌آوری اطلاعات استفاده کنیم. امکان غیرفعال کردن کوکی‌ها در تنظیمات مرورگرها وجود دارد.
                </p>
            </div>

            <p>
                در نهایت، حریم خصوصی شما اهمیت دارد و ما تضمین می‌کنیم که اطلاعات شما با دقت و مسئولیت مدیریت شود. برای اطلاعات بیشتر، با پشتیبانی در تماس باشید.
            </p>
        </Box>
    );
};

export default Privacy;
