import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))


def _send_email(to: str, subject: str, html_body: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html"))
    with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM, to, msg.as_string())


def send_round_selection_email(
    candidate_name: str,
    candidate_email: str,
    job_title: str,
    round_number: str,
):
    """
    Sent before interview details.
    Round 1 → shortlisted message
    Round 2+ → selected for next round message
    """
    if round_number == "1":
        subject = f"Congratulations! Shortlisted for Round 1 — {job_title}"
        heading = "🎉 Congratulations, you've been Shortlisted!"
        body = f"You have been <strong>shortlisted for Round 1</strong> of the selection process for <strong>{job_title}</strong>."
    else:
        subject = f"Congratulations! Selected for Round {round_number} — {job_title}"
        heading = f"🎉 Selected for Round {round_number}!"
        body = f"You have cleared Round {int(round_number) - 1} and have been selected to move forward to <strong>Round {round_number}</strong> for <strong>{job_title}</strong>."

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2e7d32;">{heading}</h2>
        <p>Dear <strong>{candidate_name}</strong>,</p>
        <p>{body}</p>
        <p>Please find your interview details in the next email.</p>
        <p>Best of luck! 🍀</p>
        <br>
        <p>Best regards,<br><strong>HR Team</strong></p>
    </body>
    </html>
    """
    _send_email(candidate_email, subject, html)


def send_interview_email(
    candidate_name: str,
    candidate_email: str,
    job_title: str,
    round_number: str,
    scheduled_at: str,
    mode: str,
    location: str = None,
    notes: str = None,
):
    """Interview details email — sent for every round."""
    location_line = f"<tr><td style='padding:8px;border:1px solid #ddd;'><strong>Location/Link</strong></td><td style='padding:8px;border:1px solid #ddd;'>{location}</td></tr>" if location else ""
    notes_line = f"<p><strong>Notes:</strong> {notes}</p>" if notes else ""
    mode_icon = "💻" if mode.lower() == "online" else "🏢"

    subject = f"Interview Details — Round {round_number} | {job_title}"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #1565c0;">📅 Round {round_number} Interview Details</h2>
        <p>Dear <strong>{candidate_name}</strong>,</p>
        <p>Here are your interview details for <strong>{job_title}</strong>:</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
            <tr>
                <td style="padding:8px;border:1px solid #ddd;"><strong>Position</strong></td>
                <td style="padding:8px;border:1px solid #ddd;">{job_title}</td>
            </tr>
            <tr style="background:#f5f5f5;">
                <td style="padding:8px;border:1px solid #ddd;"><strong>Round</strong></td>
                <td style="padding:8px;border:1px solid #ddd;">Round {round_number}</td>
            </tr>
            <tr>
                <td style="padding:8px;border:1px solid #ddd;"><strong>Date & Time</strong></td>
                <td style="padding:8px;border:1px solid #ddd;">{scheduled_at}</td>
            </tr>
            <tr style="background:#f5f5f5;">
                <td style="padding:8px;border:1px solid #ddd;"><strong>Mode</strong></td>
                <td style="padding:8px;border:1px solid #ddd;">{mode_icon} {mode}</td>
            </tr>
            {location_line}
        </table>
        {notes_line}
        <br>
        <p>Please be on time and keep this email for your reference.</p>
        <p>Best of luck! 🍀</p>
        <br>
        <p>Best regards,<br><strong>HR Team</strong></p>
    </body>
    </html>
    """
    _send_email(candidate_email, subject, html)


def send_final_selection_email(candidate_name: str, candidate_email: str, job_title: str):
    """Sent when candidate clears all rounds and is finally selected."""
    subject = f"🎉 You're Selected! — {job_title}"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2e7d32;">🎉 Congratulations {candidate_name}, You're Selected!</h2>
        <p>We are thrilled to inform you that you have successfully cleared all rounds and have been <strong>selected</strong> for the position of:</p>
        <h3 style="color: #1565c0;">{job_title}</h3>
        <p>Our HR team will contact you shortly with your offer letter and onboarding details.</p>
        <p>Welcome to the team! 🚀</p>
        <br>
        <p>Best regards,<br><strong>HR Team</strong></p>
    </body>
    </html>
    """
    _send_email(candidate_email, subject, html)


def send_rejection_email(candidate_name: str, candidate_email: str, job_title: str):
    """Sent when HR rejects a candidate."""
    subject = f"Application Update — {job_title}"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #c62828;">Application Status Update</h2>
        <p>Dear <strong>{candidate_name}</strong>,</p>
        <p>Thank you for applying for the position of <strong>{job_title}</strong>.</p>
        <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
        <p>We appreciate your time and encourage you to apply for future openings.</p>
        <p>We wish you all the best in your job search.</p>
        <br>
        <p>Best regards,<br><strong>HR Team</strong></p>
    </body>
    </html>
    """
    _send_email(candidate_email, subject, html)


def send_reschedule_email(
    candidate_name: str,
    candidate_email: str,
    job_title: str,
    round_number: str,
    scheduled_at: str,
    mode: str,
    location: str = None,
    notes: str = None,
):
    """Sent when HR reschedules an interview."""
    location_line = f"<tr><td style='padding:8px;border:1px solid #ddd;'><strong>Location/Link</strong></td><td style='padding:8px;border:1px solid #ddd;'>{location}</td></tr>" if location else ""
    notes_line = f"<p><strong>Notes:</strong> {notes}</p>" if notes else ""
    mode_icon = "💻" if mode.lower() == "online" else "🏢"

    subject = f"Interview Rescheduled — Round {round_number} | {job_title}"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #e65100;">📅 Interview Rescheduled</h2>
        <p>Dear <strong>{candidate_name}</strong>,</p>
        <p>Your Round {round_number} interview for <strong>{job_title}</strong> has been rescheduled. Here are your updated details:</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
            <tr>
                <td style="padding:8px;border:1px solid #ddd;"><strong>Position</strong></td>
                <td style="padding:8px;border:1px solid #ddd;">{job_title}</td>
            </tr>
            <tr style="background:#f5f5f5;">
                <td style="padding:8px;border:1px solid #ddd;"><strong>Round</strong></td>
                <td style="padding:8px;border:1px solid #ddd;">Round {round_number}</td>
            </tr>
            <tr>
                <td style="padding:8px;border:1px solid #ddd;"><strong>New Date & Time</strong></td>
                <td style="padding:8px;border:1px solid #ddd;">{scheduled_at}</td>
            </tr>
            <tr style="background:#f5f5f5;">
                <td style="padding:8px;border:1px solid #ddd;"><strong>Mode</strong></td>
                <td style="padding:8px;border:1px solid #ddd;">{mode_icon} {mode}</td>
            </tr>
            {location_line}
        </table>
        {notes_line}
        <br>
        <p>Please note the updated schedule and be on time.</p>
        <p>Best of luck! 🍀</p>
        <br>
        <p>Best regards,<br><strong>HR Team</strong></p>
    </body>
    </html>
    """
    _send_email(candidate_email, subject, html)


def send_offer_letter_email(
    candidate_name: str,
    candidate_email: str,
    job_title: str,
    offer_letter_path: str,
):
    """Send offer letter PDF as email attachment."""
    from email.mime.base import MIMEBase
    from email import encoders

    subject = f"Offer Letter — {job_title}"
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2e7d32;">🎉 Congratulations {candidate_name}!</h2>
        <p>We are delighted to extend an official offer for the position of:</p>
        <h3 style="color: #1565c0;">{job_title}</h3>
        <p>Please find your <strong>Offer Letter</strong> attached to this email.</p>
        <p>The offer letter contains details about your:</p>
        <ul>
            <li>Joining date</li>
            <li>Compensation and benefits</li>
            <li>Role and responsibilities</li>
            <li>Other terms and conditions</li>
        </ul>
        <p>Please review the offer letter and revert with your acceptance at the earliest.</p>
        <p>We look forward to welcoming you to the team! 🚀</p>
        <br>
        <p>Best regards,<br><strong>HR Team</strong></p>
    </body>
    </html>
    """

    # Build email with attachment
    msg = MIMEMultipart("mixed")
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM
    msg["To"] = candidate_email

    # HTML body
    msg.attach(MIMEText(html_body, "html"))

    # PDF attachment
    with open(offer_letter_path, "rb") as f:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f"attachment; filename=Offer_Letter_{candidate_name.replace(' ', '_')}.pdf",
        )
        msg.attach(part)

    with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM, candidate_email, msg.as_string())