import string
import random
from django.core.mail import send_mail
from django.utils.html import format_html


def generate_otp(length=6):
    digits = string.digits
    otp = ''.join(random.choice(digits) for _ in range(length))
    return otp


def send_otp(email, otp):
    from django.conf import settings
    subject = 'Your OTP Code'
    message = f'Your OTP code is {otp}.'
    html_message = format_html(
        """
    <h2>Reset Your Password for a2zscanner</h2>
    <p>Hello,</p>
    <p>We received a request to reset your password for your a2zscanner account.</p>
    <p>To proceed with resetting your password, please use the following One-Time Password (OTP):</p>
    <h3>OTP: <strong>{}</strong></h3>
    <p>This OTP is valid for the next 10 minutes. Please do not share it with anyone.</p>
    <p>If you did not request this, please ignore this email, and your password will remain unchanged.</p>
    <p>Thank you!<br>a2zscanner Team</p>
    """,
        otp
    )

    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]
    send_mail(subject, message, from_email,
              recipient_list, html_message=html_message)
