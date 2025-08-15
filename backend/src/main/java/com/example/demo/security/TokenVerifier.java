package com.example.demo.security;

import java.text.ParseException;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class TokenVerifier {
    private final MACVerifier mac;

    public TokenVerifier(@Value("${auth.jwt.secretB64}") String secretB64) throws JOSEException {
        this.mac = new MACVerifier(Base64.getDecoder().decode(secretB64));
    }

    public JWTClaimsSet verify(String token, String galleryId, String imageId, String requiredScope)
            throws ParseException, JOSEException {
        var jws = SignedJWT.parse(token);
        if (!jws.verify(mac)) throw new SecurityException("bad-signature");
        var claims = jws.getJWTClaimsSet();

        Date now = new Date();
        if (claims.getExpirationTime() == null || now.after(claims.getExpirationTime()))
            throw new SecurityException("expired");
        if (claims.getNotBeforeTime() != null && now.before(claims.getNotBeforeTime()))
            throw new SecurityException("nbf");

        String gid = claims.getStringClaim("gid");
        if (!Objects.equals(gid, galleryId)) throw new SecurityException("wrong-gallery");

        var scopes = Set.copyOf((List<String>) claims.getClaim("scp"));
        if (!scopes.contains(requiredScope)) throw new SecurityException("missing-scope");

        String boundImg = claims.getStringClaim("img");
        if (boundImg != null && !boundImg.equals(imageId)) throw new SecurityException("wrong-image");

        return claims;
    }
}
