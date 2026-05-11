/**
 * Delay Alert Email Template
 * Sent when a train experiences a significant delay
 */
import { Body, Button, Container, Head, Hr, Html, Link, Preview, Row, Section, Text } from '@react-email/components';
import React from 'react';

interface DelayAlertEmailProps {
  email: string;
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  scheduledTime: string;
  currentDelay: number;
  estimatedDelay: number;
  reason?: string;
  verifyLink?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function DelayAlertEmail({
  email,
  trainNumber,
  trainName,
  source,
  destination,
  scheduledTime,
  currentDelay,
  estimatedDelay,
  reason,
  verifyLink,
}: DelayAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Train ${trainNumber} delayed by ${currentDelay} minutes`}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={box}>
            <Row>
              <Text style={heading}>Train Delay Alert</Text>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={box}>
            <Row>
              <Text style={subheading}>
                Train {trainNumber} - {trainName}
              </Text>
            </Row>

            <Hr style={hr} />

            <Row>
              <Text style={label}>Route:</Text>
              <Text style={value}>
                {source} → {destination}
              </Text>
            </Row>

            <Row>
              <Text style={label}>Scheduled Time:</Text>
              <Text style={value}>{scheduledTime}</Text>
            </Row>

            <Row>
              <Text style={delayAlert}>⚠️ Current Delay: {currentDelay} minutes</Text>
            </Row>

            <Row>
              <Text style={label}>Estimated Delay:</Text>
              <Text style={value}>{estimatedDelay} minutes</Text>
            </Row>

            {reason && (
              <>
                <Row>
                  <Text style={label}>Reason:</Text>
                  <Text style={value}>{reason}</Text>
                </Row>
              </>
            )}

            <Hr style={hr} />

            <Row>
              <Button style={button} href={`${baseUrl}/train/${trainNumber}`}>
                View Train Details
              </Button>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={box}>
            <Text style={footer}>
              You received this email because you subscribed to train delay notifications.
            </Text>
            {verifyLink && (
              <Text style={footer}>
                <Link href={verifyLink} style={link}>
                  Manage your preferences
                </Link>
              </Text>
            )}
            <Text style={footer}>© 2025 YatraLive Train Tracker</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function DelayAlertPlainText({
  trainNumber,
  trainName,
  source,
  destination,
  scheduledTime,
  currentDelay,
  estimatedDelay,
  reason,
}: DelayAlertEmailProps): string {
  return `
Train Delay Alert

Train ${trainNumber} - ${trainName}

Route: ${source} → ${destination}
Scheduled Time: ${scheduledTime}

Current Delay: ${currentDelay} minutes
Estimated Delay: ${estimatedDelay} minutes

${reason ? `Reason: ${reason}` : ''}

View train details: ${baseUrl}/train/${trainNumber}

You received this email because you subscribed to train delay notifications.
© 2025 YatraLive Train Tracker
`.trim();
}

// Styles
const main = {
  backgroundColor: '#f3f4f6',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '16px 0',
  color: '#1f2937',
};

const subheading = {
  fontSize: '20px',
  fontWeight: '600',
  margin: '16px 0',
  color: '#374151',
};

const label = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  margin: '8px 0 4px 0',
};

const value = {
  fontSize: '14px',
  color: '#1f2937',
  margin: '0 0 12px 0',
};

const delayAlert = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#dc2626',
  margin: '0 0 12px 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '16px 0',
  padding: '12px 24px',
  textDecoration: 'none',
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '4px 0',
};
