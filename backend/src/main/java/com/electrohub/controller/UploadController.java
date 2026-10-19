package com.electrohub.controller;

import com.electrohub.service.CloudStorageService;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.*;
import java.util.*;
import javax.imageio.*;
import javax.imageio.stream.ImageInputStream;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class UploadController {
  private final CloudStorageService storage;
  public UploadController(CloudStorageService storage){this.storage=storage;}

  @PostMapping("/api/admin/uploads")
  Map<String,String> upload(@RequestParam("file") MultipartFile file)throws Exception{
    if(file.isEmpty()||file.getSize()>5*1024*1024)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Image must be between 1 byte and 5 MB");
    BufferedImage decoded;
    try(ImageInputStream input=ImageIO.createImageInputStream(file.getInputStream())){
      Iterator<ImageReader> readers=ImageIO.getImageReaders(input);
      if(!readers.hasNext())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Only valid JPG and PNG images are supported");
      ImageReader reader=readers.next();
      try{
        reader.setInput(input);
        String format=reader.getFormatName().toLowerCase(Locale.ROOT);
        if(!Set.of("jpeg","jpg","png").contains(format))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Only JPG and PNG are supported");
        if((long)reader.getWidth(0)*reader.getHeight(0)>16000000)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Image resolution must be below 16 megapixels");
        decoded=reader.read(0);
      }finally{reader.dispose();}
    }
    ByteArrayOutputStream out=new ByteArrayOutputStream();
    ImageIO.write(decoded,"png",out);
    return Map.of("url",storage.savePng(out.toByteArray()));
  }

  @PostMapping("/api/admin/uploads/video")
  Map<String,String> uploadVideo(@RequestParam("file") MultipartFile file)throws Exception{
    if(file.isEmpty()||file.getSize()>30L*1024*1024)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Video must be between 1 byte and 30 MB");
    byte[] bytes=file.getBytes();
    String type=Optional.ofNullable(file.getContentType()).orElse("").toLowerCase(Locale.ROOT);
    String ext;
    if(isMp4(bytes) && (type.isBlank() || type.equals("video/mp4") || type.equals("application/octet-stream"))){type="video/mp4";ext="mp4";}
    else if(isWebm(bytes) && (type.isBlank() || type.equals("video/webm") || type.equals("application/octet-stream"))){type="video/webm";ext="webm";}
    else throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Only valid MP4 or WebM videos are supported");
    return Map.of("url",storage.saveVideo(bytes,ext,type));
  }

  private boolean isMp4(byte[] b){return b.length>12 && b[4]=='f' && b[5]=='t' && b[6]=='y' && b[7]=='p';}
  private boolean isWebm(byte[] b){return b.length>4 && (b[0]&0xff)==0x1A && (b[1]&0xff)==0x45 && (b[2]&0xff)==0xDF && (b[3]&0xff)==0xA3;}

  @GetMapping("/uploads/{name:.+}")
  ResponseEntity<Resource> media(@PathVariable String name)throws Exception{
    if(!name.matches("[a-f0-9-]{36}\\.(png|mp4|webm)"))throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    Path p=storage.localPath(name);
    if(!p.getParent().equals(storage.localRoot())||!Files.isRegularFile(p))throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    MediaType type=name.endsWith(".png")?MediaType.IMAGE_PNG:name.endsWith(".mp4")?MediaType.parseMediaType("video/mp4"):MediaType.parseMediaType("video/webm");
    return ResponseEntity.ok().contentType(type).contentLength(Files.size(p)).header("Cache-Control","public,max-age=86400").body(new FileSystemResource(p));
  }
}
