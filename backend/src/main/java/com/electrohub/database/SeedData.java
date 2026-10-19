package com.electrohub.database;

import com.electrohub.repository.SeedRepository;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SeedData implements ApplicationRunner {
  private final SeedRepository repository; private final PasswordEncoder passwords; private final String email,password; private final boolean seed;
  public SeedData(SeedRepository repository,PasswordEncoder passwords,@Value("${app.owner.email}") String email,@Value("${app.owner.password}") String password,@Value("${app.seed}") boolean seed){this.repository=repository;this.passwords=passwords;this.email=email;this.password=password;this.seed=seed;}
  @Override @Transactional public void run(ApplicationArguments args){if(!repository.ownerExists()){if(!email.matches("[^@\\s]+@[^@\\s]+\\.[^@\\s]+")||password.length()<12||password.length()>72)throw new IllegalStateException("Set ADMIN_EMAIL and a 12-72 character ADMIN_PASSWORD in backend/.env before first start.");repository.createOwner(UUID.randomUUID().toString(),email.strip().toLowerCase(Locale.ROOT),passwords.encode(password));}if(!seed||repository.hasCategories())return;String[] names={"Smartphones","Laptops","Audio","Gaming","TVs","Wearables","Cameras","Components"};String[] files={"smartphones","laptops","audio","gaming","tvs","wearables","cameras","components"};String[] products={"Everyday Smartphone","Ultra Slim Laptop","Wireless Headphones","Wireless Game Controller","4K Smart Television","Fitness Smart Watch","Mirrorless Camera","Desktop Graphics Card"};long[] prices={2499900,6499900,499900,349900,3999900,299900,7499900,3299900};for(int i=0;i<names.length;i++){String c=UUID.randomUUID().toString(),p=UUID.randomUUID().toString(),image="/images/"+files[i]+".jpg";repository.insertCategory(c,names[i],image,"Explore "+names[i].toLowerCase(Locale.ROOT));repository.insertProduct(p,c,products[i],"Demo catalogue item for local testing. The photograph is illustrative. The store owner should replace this description, price, stock and photograph before accepting real orders.",prices[i],prices[i]+100000,15,image,"[\""+image+"\"]","Demo",true,i%2==0);}}
}
