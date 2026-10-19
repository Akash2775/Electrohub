package com.electrohub.service;

import java.nio.file.Path;

public interface CloudStorageService {
  String savePng(byte[] bytes) throws Exception;
  String saveVideo(byte[] bytes, String extension, String contentType) throws Exception;
  Path localPath(String name);
  Path localRoot();
}
