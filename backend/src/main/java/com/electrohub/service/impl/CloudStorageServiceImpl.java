package com.electrohub.service.impl;

import com.electrohub.service.CloudStorageService;
import java.net.URI;
import java.nio.file.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.*;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class CloudStorageServiceImpl implements CloudStorageService {
  private final String provider; private final Path localRoot; private final String accountId,accessKey,secretKey,bucket,publicBase;
  public CloudStorageServiceImpl(@Value("${app.storage.provider:local}") String provider,@Value("${app.upload-dir:uploads}") String localDir,@Value("${app.r2.account-id:}") String accountId,@Value("${app.r2.access-key-id:}") String accessKey,@Value("${app.r2.secret-access-key:}") String secretKey,@Value("${app.r2.bucket:}") String bucket,@Value("${app.r2.public-base-url:}") String publicBase)throws Exception{this.provider=provider.strip().toLowerCase(Locale.ROOT);this.localRoot=Path.of(localDir).toAbsolutePath().normalize();this.accountId=accountId;this.accessKey=accessKey;this.secretKey=secretKey;this.bucket=bucket;this.publicBase=publicBase.replaceAll("/$","");Files.createDirectories(localRoot);}
  @Override public String savePng(byte[] bytes)throws Exception{return save(bytes,"png","image/png","products");}
  @Override public String saveVideo(byte[] bytes,String extension,String contentType)throws Exception{return save(bytes,extension,contentType,"products/videos");}
  private String save(byte[] bytes,String extension,String contentType,String folder)throws Exception{
    String safeExt=extension.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]","");
    String name=UUID.randomUUID()+"."+safeExt;
    if(!"r2".equals(provider)){Files.write(localRoot.resolve(name),bytes,StandardOpenOption.CREATE_NEW);return "/uploads/"+name;}
    if(accountId.isBlank()||accessKey.isBlank()||secretKey.isBlank()||bucket.isBlank()||publicBase.isBlank())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Cloudflare R2 is selected but its credentials/public URL are missing in backend/.env");
    try(S3Client s3=S3Client.builder().endpointOverride(URI.create("https://"+accountId+".r2.cloudflarestorage.com")).region(Region.of("auto")).credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey,secretKey))).serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).chunkedEncodingEnabled(false).build()).build()){
      s3.putObject(PutObjectRequest.builder().bucket(bucket).key(folder+"/"+name).contentType(contentType).cacheControl("public,max-age=31536000,immutable").build(),RequestBody.fromBytes(bytes));
    }
    return publicBase+"/"+folder+"/"+name;
  }
  @Override public Path localPath(String name){return localRoot.resolve(name).normalize();}
  @Override public Path localRoot(){return localRoot;}
}
