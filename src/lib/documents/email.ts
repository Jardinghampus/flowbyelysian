import { Resend } from 'resend'
import type { SendSigningRequestParams } from './types'

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM_EMAIL = 'ZFlow <contracts@zflow.ae>'

export async function sendSigningRequest({
  signerEmail,
  signerName,
  agentName,
  documentName,
  signToken,
}: SendSigningRequestParams) {
  const signUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${signToken}`

  await getResendClient().emails.send({
    from: FROM_EMAIL,
    to: signerEmail,
    subject: `Please sign: ${documentName}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fafafa; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 600; margin: 0; color: #fafafa;">ZFlow</h1>
          <p style="color: #a3a3a3; font-size: 13px; margin-top: 4px;">Document Signing</p>
        </div>

        <p style="color: #e5e5e5; font-size: 15px; line-height: 1.6;">Hi ${signerName},</p>
        <p style="color: #e5e5e5; font-size: 15px; line-height: 1.6;">
          <strong>${agentName}</strong> has sent you a document to review and sign:
        </p>
        <p style="color: #fafafa; font-size: 16px; font-weight: 500; background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 8px; border-left: 3px solid #00d4ff;">
          ${documentName}
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${signUrl}" style="display: inline-block; padding: 14px 32px; background: #00d4ff; color: #000000; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 8px;">
            Review & Sign Document
          </a>
        </div>

        <p style="color: #737373; font-size: 13px; text-align: center;">This link expires in 7 days.</p>

        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 32px 0;" />
        <p style="color: #525252; font-size: 12px; text-align: center;">
          Powered by ZFlow — Dubai Real Estate CRM
        </p>
      </div>
    `,
  })
}

export async function sendSignedConfirmation({
  agentEmail,
  agentName,
  signerName,
  documentName,
  pdfUrl,
}: {
  agentEmail: string
  agentName: string
  signerName: string
  documentName: string
  pdfUrl: string
}) {
  await getResendClient().emails.send({
    from: FROM_EMAIL,
    to: agentEmail,
    subject: `Document signed — ${signerName}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fafafa; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 600; margin: 0; color: #fafafa;">ZFlow</h1>
          <p style="color: #a3a3a3; font-size: 13px; margin-top: 4px;">Document Signed</p>
        </div>

        <p style="color: #e5e5e5; font-size: 15px; line-height: 1.6;">Hi ${agentName},</p>
        <p style="color: #e5e5e5; font-size: 15px; line-height: 1.6;">
          <strong>${signerName}</strong> has signed the following document:
        </p>
        <p style="color: #fafafa; font-size: 16px; font-weight: 500; background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 8px; border-left: 3px solid #22c55e;">
          ${documentName}
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${pdfUrl}" style="display: inline-block; padding: 14px 32px; background: #22c55e; color: #000000; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 8px;">
            View Signed PDF
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 32px 0;" />
        <p style="color: #525252; font-size: 12px; text-align: center;">
          Powered by ZFlow — Dubai Real Estate CRM
        </p>
      </div>
    `,
  })
}
