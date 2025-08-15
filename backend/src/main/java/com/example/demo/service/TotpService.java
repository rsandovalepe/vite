package com.example.demo.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
public class TotpService {
    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    public String generateSecret() {
        return gAuth.createCredentials().getKey();
    }

    public boolean verifyCode(String secret, int code) {
        return gAuth.authorize(secret, code);
    }

    public String getOtpAuthURL(String username, String secret) {
        try {
            String issuer = URLEncoder.encode("DemoApp", StandardCharsets.UTF_8.toString());
            String user = URLEncoder.encode(username, StandardCharsets.UTF_8.toString());
            return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s", issuer, user, secret, issuer);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create OTP auth URL", e);
        }
    }

    public String generateQrImage(String otpAuthUrl) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(otpAuthUrl, BarcodeFormat.QR_CODE, 200, 200);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR image", e);
        }
    }
}
