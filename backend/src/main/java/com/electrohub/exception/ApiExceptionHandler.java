package com.electrohub.exception;

import java.util.Map;
import org.slf4j.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
  private static final Logger log=LoggerFactory.getLogger(ApiExceptionHandler.class);
  @ExceptionHandler(ResponseStatusException.class) ResponseEntity<?> expected(ResponseStatusException e){return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null?"Request failed":e.getReason()));}
  @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(MethodArgumentNotValidException e){return ResponseEntity.badRequest().body(Map.of("message",e.getBindingResult().getFieldErrors().stream().map(x->x.getField()+": "+x.getDefaultMessage()).findFirst().orElse("Invalid request")));}
  @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> conflict(){return ResponseEntity.status(409).body(Map.of("message","This record already exists or is still in use."));}
  @ExceptionHandler(MaxUploadSizeExceededException.class) ResponseEntity<?> size(){return ResponseEntity.status(413).body(Map.of("message","Choose an image smaller than 5 MB."));}
  @ExceptionHandler(Exception.class) ResponseEntity<?> other(Exception e){log.error("Request failed",e);return ResponseEntity.status(500).body(Map.of("message","The server could not complete this request. Please try again."));}
}
